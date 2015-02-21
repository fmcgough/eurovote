"use strict";

var models = require("../models");
var auth = require("./auth");
var sequelize = models.sequelize;

module.exports = function(app) {
	app.get("/", auth.authenticated, function(req, res){
		req.user.getGroup().then(function(group){
			getCountryVotes(group, function(countries){
				res.render("index", {
					title: "Eurovision 2015",
					navbarActive: "Home",
					countries: countries
				});
			});
		}).catch(function(err){
			console.log(err);
			res.sendStatus(500);
		});
	});
}

function getCountryVotes(group, callback) {
	models.Country.findAll({
		include: [{
			model: models.Vote,
			where: {GroupId: group ? group.id : null},
			required: false
		}],
		attributes: [[sequelize.fn("ifnull",
						sequelize.fn("SUM",
							sequelize.col("Votes.score")),
						0),
						"total"],
					[sequelize.col("Country.name"), "name"]],
		group: [ "Country.id" ],
		order: "total DESC"
	}).then(function(countries){
		callback(countries);
	});
}
