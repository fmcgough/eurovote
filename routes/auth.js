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

exports.authenticated = function(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}
