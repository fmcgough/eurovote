
"use strict";

module.exports = function(sequelize, DataTypes) {
	var Vote = sequelize.define("Vote", {
		score: DataTypes.INTEGER,
	}, {
		classMethods: {
			associate: function(models) {
				Vote.belongsTo(models.Country);
				Vote.belongsTo(models.Group);
			}
		}
	});

	return Vote;
};
