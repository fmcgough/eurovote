var models = require("../../models"),
    Group = models.Group,
    User = models.User,
    form = require("express-form"),
    field = form.field;

exports.display = function(req, res) {
    var group = req.user.getGroup({include: [User]})
        .success(function(group){
            res.render("group", {
                title: "Group",
                navbarActive: "Group",
                group: group
            });
        }).error(function(err){
            console.log(err);
            res.status(500).send(err);
        });
}

exports.createValidator = form(
    field("groupName", "Group name").trim().required()
);

exports.create = function(req, res) {
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
}

function createGroupErrors(res, errors) {
    return res.render("group", {
        title: "Group",
        navbarActive: "Group",
        createErrors: errors
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

exports.join = function(req, res) {
    Group.find({
        where: {code: req.body.groupCode}
    }).success(function(group){
        console.log(group);
        if (group) {
            group.addUser(req.user).success(function(){
                return res.redirect("/group");
            }).error(function(err){
                return joinGroupError(res, [err]);
            });
        } else {
            return joinGroupError(res, ["Group not found"]);
        }
    }).error(function(err){
        return joinGroupError(res, [err]);
    });
}

function joinGroupError(res, errors) {
    return res.render("group", {
        title: "Group",
        navbarActive: "Group",
        joinErrors: errors
    });
}
