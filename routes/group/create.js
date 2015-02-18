var models = require("../../models"),
    Group = models.Group,
    form = require("express-form"),
    field = form.field,
    authenticated = require("../auth").authenticated;

var createValidator = form(
    field("groupName", "Group name").trim().required()
);

module.exports = function(app) {
    app.post("/group/create", authenticated, createValidator, function(req, res) {
        if (!req.form.isValid) {
            return createGroupErrors(res, req.form.errors);
        }
        var groupName = req.form.groupName;
        var code = createCode(groupName);
        console.log(code);
        checkIfGroupNameExists(groupName, function(err, result) {
            if (err) {
                return createGroupErrors(res, [err]);
            } else if (result) {
                return createGroupErrors(res, ["Group name already exists"]);
            } else {
                Group.create({
                    name: req.form.groupName,
                    code: code
                }).complete(function(err, group) {
                    if (err) {
                        return createGroupErrors(res, [err]);
                    }
                    group.addUser(req.user).done(function(){
                        res.redirect("/group");
                    });
                });
            }
        });
    });
}

function createCode(groupName) {
    var substring = groupName.replace(/ /g, "").substring(0, 5).toUpperCase();
    var random = Math.floor(Math.random() * 900) + 100;
    return substring + random;
}

function checkIfGroupNameExists(groupName, callback) {
    Group.findOne({
        where: {name: groupName}
    }).success(function(group) {
        return callback(null, !!group);
    }).error(function(err){
        return callback(err);
    });
}

function createGroupErrors(res, errors) {
    return res.render("group", {
        title: "Group",
        navbarActive: "Group",
        createErrors: errors
    });
}
