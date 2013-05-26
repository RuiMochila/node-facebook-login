var express = require('express')
  , passport = require('passport')
  , util = require('util')
  , FacebookStrategy = require('passport-facebook').Strategy;

var FACEBOOK_APP_ID = "521284161253406"
var FACEBOOK_APP_SECRET = "0fd60a80a0b0be7c437bb6743bf4f6aa";


passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


var userProfile;
passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    //ATENCAO À PORTA!! FOI A QUE REGISTEI NO FACEBOOK
    callbackURL: "http://localhost:8080/auth/facebook/callback" 
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      
      //usar o accessToken e fazer um GET request a graph/100000981084408/friends?fields=username,name
      //para ter a lista de amigos com id, displayName e username

      // The user's Facebook profile is returned to
      // represent the logged-in user.
      userProfile = profile;
      return done(null, profile);
    });
  }
));




var app = express();

// configure Express
app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});


app.get('/', ensureAuthenticated, function(req, res){
  console.log(req.user);
  //console.log("Profile: "+ JSON.stringify(userProfile));
  res.render('index', { user: req.user, pic: "https://graph.facebook.com/"+req.user.username+"/picture" });
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});


app.get('/auth/facebook',
  passport.authenticate('facebook'),
  function(req, res){
    // The request will be redirected to Facebook for authentication, so this
    // function will not be called.
  });


app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.listen(8080);


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}
