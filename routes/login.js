"use strict";

var passport = require("./auth").passport;

module.exports = function(app) {
    app.get("/login", function(req, res) {
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
    });

    app.post("/login", function(req, res, next) {
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
    });

    app.get("/logout", function(req, res) {
        if (req.isAuthenticated()) {
            req.logout();
            req.session.error = null;
            req.session.message = "Logged out successfully";
        }
        res.redirect("/login");
    });
}
