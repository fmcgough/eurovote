"use strict";

var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var User = require("../models").User;

passport.use(new LocalStrategy({
    usernameField: "username",
    passwordField: "password"
}, function(username, password, done) {
    User.find({
        where: {username: username}
    }).success(function(user){
        if (!user) {
            return done(null, false, {
                message: "Username does not exist."
            });
            // TODO implement password hashing
        } else if (!hashing.compare(password, user.passwordHash)) {
            return done(null, false, {
                message: "Username or password is incorrect."
            });
        } else {
            return done(null, user);
        }
    }).error(function(err){
        return done(err);
    });
}));

exports.passport = passport;
