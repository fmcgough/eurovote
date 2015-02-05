
/*
 * GET home page.
 */

var models = require("../models");
var sequelize = models.sequelize;

exports.index = function(req, res) {
	models.Country.findAll({
		include: [{
			model: models.Vote,
			attributes: [[sequelize.fn("SUM", sequelize.col("Votes.score")), "total"]]
		}],
		group: [ "Country.id" ]
	}).then(function(countries){
		for (var i in countries) {
			// Set the total score as a top-level property on the object
			countries[i].total = countries[i].Votes[0].dataValues.total;
		}
		res.render("index", {
			title: "Eurovision 2015",
			navbarActive: "Home",
			countries: countries
		});
	});
};

