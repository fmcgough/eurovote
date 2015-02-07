
"use strict";

module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define("User", {
        username: DataTypes.STRING,
        email: DataTypes.STRING,
        passwordHash: DataTypes.STRING
    },{
        classMethods: {
            associate: function(models) {
                User.belongsTo(models.Group);
            }
        }
    });

    return User;
};
