var models = require("../../models"),
    Group = models.Group,
    authenticated = require("../auth").authenticated;

module.exports = function(app) {
    app.post("/group/join", authenticated, function(req, res) {
        Group.find({
            where: {code: req.body.groupCode}
        }).success(function(group){
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
    });
}

function joinGroupError(res, errors) {
    return res.render("group", {
        title: "Group",
        navbarActive: "Group",
        joinErrors: errors
    });
}
