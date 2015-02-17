var models = require("../../models"),
    Group = models.Group,
    User = models.User,
    authenticated = require("../login").authenticated;

module.exports = function(app) {
    app.get("/group", authenticated, function(req, res){
        var group = req.user.getGroup({include: [User]})
            .success(function(group){
                res.render("group", {
                    title: "Group",
                    navbarActive: "Group",
                    group: group
                });
            }).error(function(err){
                res.status(500).send(err);
            });
    });
}
