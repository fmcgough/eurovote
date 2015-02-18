"use strict";

var models = require("../models");
var auth = require("./auth");
var sequelize = models.sequelize;

module.exports = function(app) {
	app.get("/", auth.authenticated, function(req, res){
		models.Country.findAll({
			include: [{
				model: models.Vote
			}],
			attributes: [[sequelize.fn("SUM", sequelize.col("Votes.score")), "total"],
						[sequelize.col("Country.name"), "name"]],
			group: [ "Country.id" ],
			order: "total DESC"
		}).then(function(countries){
			res.render("index", {
				title: "Eurovision 2015",
				navbarActive: "Home",
				countries: countries
			});
		});
	});
}
