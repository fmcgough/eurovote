"use strict";

var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var User = require("../models").User;
var bcrypt = require("bcrypt-nodejs");

passport.use(new LocalStrategy({
    usernameField: "username",
    passwordField: "password"
}, function(username, password, done) {
    User.find({
        where: {username: username}
    }).success(function(user){
        if (!user) {
            return done(null, false, {
                message: "Username or password is incorrect."
            });
        } else {
            bcrypt.compare(password, user.passwordHash, function(err, res){
                if(err) {
                    return done(err);
                }
                if (!res) {
                    return done(null, false, {
                        message: "Username or password is incorrect."
                    });
                } else {
                    return done(null, user);
                }
            });
        }
    }).error(function(err){
        return done(err);
    });
}));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.find(id)
        .success(function(user){
            done(null, user);
        }).error(function(err){
            done(new Error("User " + id + " does not exist"));
        });
});

exports.passport = passport;

exports.display = function(req, res) {
    if (req.user) {
        // Already logged in
        res.redirect("/");
    } else {
        res.render("login", {
            title: "Log in",
            error: req.session.error,
            message: req.session.message
        });
    }
}

exports.login = function(req, res, next) {
    // ask passport to authenticate
  passport.authenticate('local', function(err, user, info) {
    if (err) {
      // if error happens
      return next(err);
    }

    if (!user) {
      // if authentication failed, get the error message that we set
      // from previous (info.message) step, assign it into to
      // req.session and redirect to the login page again to display
      req.session.message = null;
      req.session.error = info.message;
      return res.redirect('/login');
    }

    // if everything's OK
    req.logIn(user, function(err) {
      if (err) {
        req.session.message = null;
        req.session.error = "Error";
        return next(err);
      }

      // set the message
      req.session.error = null;
      req.session.message = "Login successful.";
      return res.redirect('/');
    });

  })(req, res, next);
}

exports.logout = function(req, res) {
    if (req.isAuthenticated()) {
        req.logout();
        req.session.error = null;
        req.session.message = "Logged out successfully";
    }
    res.redirect("/login");
}

exports.locals = function(req, res, next) {
    res.locals.isAuthenticated = req.isAuthenticated();
    if (req.user){
        res.locals.username = req.user.username;
    }
    next();
};

exports.authenticated = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}
