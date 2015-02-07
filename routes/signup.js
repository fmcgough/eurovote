var form = require("express-form"),
    field = form.field;

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
        res.status(400).render("signup", {
            title: "Sign Up",
            errors: req.form.errors
        });
    }
};
