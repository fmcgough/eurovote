
"use strict";

module.exports = function(sequelize, DataTypes) {
	var Vote = sequelize.define("Vote", {
		score: DataTypes.INTEGER,
	}, {
		classMethods: {
			associate: function(models) {
				Vote.belongsTo(models.Country);
			}
		}
	});
	
	return Vote;
};
