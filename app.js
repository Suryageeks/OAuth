const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const session = require("express-session");

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth2").Strategy;

var userProfile;

function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(400);
}
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: "SECRET",
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.set("view engine", "ejs");

// Regular middleware
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cookieParser());

// Server start
app.listen(8001, () => {
  console.log(`Server running at 8001`);
});

// Passport controller
app.get("/success", isLoggedIn, (req, res) => {
  res.render("pages/info", { user: userProfile });
  console.log(userProfile);
});

app.get("/error", (req, res) => {
  res.send("Error while trying to login");
});

app.get("/logout", (req, res) => {
  req.logout();
  req.session.destroy();
  res.redirect("/");
});

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

// Routes
app.get("/", (req, res) => {
  res.render("pages/auth");
});

// Google AUTH
const GOOGLE_CLIENT_ID =
  "1055069881053-7o6mbf8culcu8l5veggesqrdlkcp6nd7.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8001/auth/google/callback",
      passReqToCallback: true,
    },
    function (request, accessToken, refreshToken, profile, done) {
      userProfile = profile;
      return done(null, profile);
    }
  )
);

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google"),
  (req, res) => {
    res.redirect("/success");
  }
);
