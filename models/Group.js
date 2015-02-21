
"use strict";

module.exports = function(sequelize, DataTypes) {
    var Group = sequelize.define("Group", {
        name: {type: DataTypes.STRING, unique: true},
        code: {type: DataTypes.STRING, unique: true}
    },{
        classMethods: {
            associate: function(models) {
                Group.hasMany(models.User);
                Group.hasMany(models.Vote);
            }
        }
    });

    return Group;
};
