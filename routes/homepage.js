"use strict";

var auth = require("./auth");

module.exports = function(app) {
	app.get("/", auth.authenticated, function(req, res){
		res.render("index", {
			title: "Eurovision 2015",
			navbarActive: "Home"
		});
	});
}
