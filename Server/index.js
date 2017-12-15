const path = require( 'path' );
const { saveNewUser, saveNewTrip, getTrips, getSpots } = require( '../Db/index.js' );
const db = require( '../Db/schema.js' );
const PORT = process.env.PORT || 3000;
const express = require( 'express' );
const app = express();
const server = require( 'http' ).createServer( app );
const passport = require( 'passport' );
const bodyParser = require( 'body-parser' );
const cookieParser = require( 'cookie-parser' );
const session = require( 'express-session' );
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
app.use( cookieParser());
app.use( bodyParser.json());
app.use( bodyParser.urlencoded({
  extended: true
}));
app.use( passport.initialize());
app.use( passport.session());
app.use(session({secret: 'hellofuturebenji',
  saveUninitialized: true,
  resave: true}));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(id, done) {
  db.User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.LOCAL_GOOGLE_REDIRECT || 'https://peri-app-apollo-hr.herokuapp.com/auth/google/callback',
  passReqToCallback: true
},
function(userInfo, accessToken, refreshToken, profile, done) {
  process.nextTick(function () {
    console.log('SESSION id line 33 server =', userInfo.sessionID);
    db.User.find({username: profile.displayName}, function(err, user) {
      if (err) {
        console.log('error line 36 server');
        return done(err);
      }
      if (user) {
        console.log('found user line 49 server', user);
        return done(null, user);
      } else {
        console.log('LINE 52 CHECKING!!!!!');
        var newUser = {
          username: profile.emails[0].value,
          sessionID: userInfo.sessionID
        };
        saveNewUser(newUser);
        return done(null, newUser);
      }
    });
    // SessionID IS userInfo.sessionID
    //Full name IS profile.displayName
    //Email IS profile.emails[0].value
  });
}
));

//NEWWW
app.get('/auth/google', passport.authenticate('google', {scope: ['profile', 'email']}));

app.get('/auth/google/callback',
  passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/auth/google' }));

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

var ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
};

//GET ALL TRIPS
app.get('/trips', (req, res) => {
  getTrips((err, trips) => {
    if (err) {
      res.send(err);
    }
    res.send(trips);
  });
});

app.post('/spots', (req, res) => {
  // console.log('REQ TRIP ID', req.body)
  getSpots(req.body.tripId, (err, spots) => {
    if (err) {
      console.log('error line 128 server =', error);
    }
    // console.log('SPOTS server l131 =', spots)
    res.send(spots);
  });
});

app.post('/api/saveTrip', (req, res) => {
  console.log(req.body);
  saveNewTrip(req.body, (err, status) => {
    if (err) {
      res.send(err);
    } else {
      res.send(status);
    }
  });
});

app.use(express.static(path.join(__dirname, '../Client/dst')));
app.listen(PORT, () => console.log(`Listening on ${ PORT }`));