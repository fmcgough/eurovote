
"use strict";

module.exports = function(sequelize, DataTypes) {
	var Country = sequelize.define("Country", {
		name: DataTypes.STRING,
	},{
		classMethods: {
			associate: function(models) {
				Country.hasMany(models.Vote);
			}
		}
	});

	return Country;
};