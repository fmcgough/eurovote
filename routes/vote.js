"use strict";

var async = require('async');
var models = require("../models");
var auth = require("./auth");

module.exports = function(app) {
	app.get("/vote", auth.authenticated, function(req, res) {
		models.Country.findAll({
			order: "name ASC"
		}).then(function(countries) {
			res.render("vote", {
				title: "Vote",
				navbarActive: "Vote",
				countries: countries
			});
		});
	});

	app.post("/vote", auth.authenticated, function(req, res) {
		var votes = JSON.parse(req.body.data);
		insertVotes(votes, req.user, function(err) {
			if (err) {
				res.status(500).send("Sorry, something went wrong!");
			} else {
				res.sendStatus(200);
			}
		});
	});
}

function insertVotes(votes, user, complete) {
	user.getGroup().then(function(group){
		async.each(votes, function(vote, callback){
			models.Vote.create({
				CountryId: vote.id,
				score: vote.score,
				GroupId: group.id
			}).complete(function(err, result) {
				callback(err);
			});
		}, function(err){
			complete(err);
		});
	}).catch(function(err){
		complete(err);
	});
}
