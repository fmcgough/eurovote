"use strict";

var form = require("express-form"),
    field = form.field,
    models = require("../models"),
    User = models.User,
    bcrypt = require("bcrypt-nodejs"),
    auth = require("./auth");

var validator = form(
    field("email", "Email").trim()
        .required()
        .isEmail("Email address is not valid"),
    field("username", "Username").trim()
        .required()
        .isAlphanumeric("Username must contain only alphanumeric characters"),
    field("password", "Password")
        .required()
        .minLength(8, "Password must be at least 8 characters"),
    field("confirmPassword", "Password confirmation")
        .required()
        .equals("field::password", "Passwords do not match")
);

module.exports = function(app) {
    app.get("/signup", function(req, res){
        res.render("signup", {
            title: "Sign Up"
        });
    });

    app.post("/signup", validator, function(req, res) {
        if (!req.form.isValid) {
            signupError(req.form.errors, 400, res);
            return;
        }
        User.findAll({
            where: {username: req.form.username}
        }).then(function(users){
            if (users.length > 0) {
                return signupError(["Username is already in use"], 500, res);
            }
            User.findAll({
                where: {email: req.form.email}
            }).then(function(users){
                if (users.length > 0) {
                    return signupError(["User already exists for this email address"],
                        500, res);
                }

                hashPassword(req.form.password, function(err, hash){
                    if (err) {
                        return signupError([err], 500, res);
                    }
                    User.create({
                        username: req.form.username,
                        email: req.form.email,
                        passwordHash: hash
                    }).complete(function(err, user){
                        if (err)  {
                            return signupError([err], 500, res);
                        }
                        // TODO send confirmation email
                        // Store in session
                        req.logIn(user, function(err) {
                            if (err) {
                                return signupError([err], 500, res);
                            }

                            return res.redirect('/');
                        });
                    });
                });
            });
        });
    });
}

function signupError(errors, status, res) {
    res.status(status).render("signup", {
        title: "Sign Up",
        errors: errors
    });
}

function hashPassword(password, callback) {
    bcrypt.genSalt(10, function(salt) {
        bcrypt.hash(password, salt, null, callback);
    });
}
