var form = require("express-form"),
    field = form.field,
    models = require("../models"),
    User = models.User,
    bcrypt = require("bcrypt-nodejs");

exports.display = function(req, res) {
    res.render("signup", {
        title: "Sign Up"
    });
};

exports.validator = form(
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

exports.signup = function(req, res) {
    if (!req.form.isValid) {
        signupError(req.form.errors, 400, res);
        return;
    }
    User.findAll({
        where: {username: req.form.username}
    }).then(function(users){
        if (users.length > 0) {
            signupError(["Username is already in use"], 500, res);
            return;
        }
        User.findAll({
            where: {email: req.form.email}
        }).then(function(users){
            if (users.length > 0) {
                signupError(["User already exists for this email address"], 500, res);
                return;
            }

            User.create({
                username: req.form.username,
                email: req.form.email,
                passwordHash: bcrypt.hashSync(req.form.password)
            }).complete(function(err, user){
                if (err)  {
                    signupError([err], 500, res);
                    return;
                }
                // TODO send confirmation email
                // Store in session
                req.session.user = user;
                // Redirect to home page
                res.redirect(200, "/");
            });
        });
    });
};

function signupError(errors, status, res) {
    res.status(status).render("signup", {
        title: "Sign Up",
        errors: errors
    });
}
