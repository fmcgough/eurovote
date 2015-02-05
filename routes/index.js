
/*
 * GET home page.
 */

var models = require("../models");
var sequelize = models.sequelize;

exports.index = function(req, res) {
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
};
