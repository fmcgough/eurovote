
/*
 * GET voting page
 */

var pg = require('pg');
var async = require('async');

var connUrl = process.env.DATABASE_URL || "pg://ev_user:fabulous@localhost:5432/eurovision";

exports.display = function(req, res) {
    pg.connect(connUrl, function(err, client, done) {
        if (err) {
            return console.error("Error getting a connection", err);
        }
        client.query("select id, name from countries order by name asc", function(err, result) {
            done();
            if (err) {
                return console.error("Error performing query", err);
            }
            res.render('vote', {title: 'Vote',
                        navbarActive : 'Vote',
                        countries : result.rows});
        });
    });
};

exports.submit = function(req, res) {
    var votes = JSON.parse(req.body.data);
    insertVotes(votes);
};

function insertVotes(votes) {
    pg.connect(connUrl, function(err, client, done) {
        if (err) {
            throw err;
        }
        var queryConfig = {
            text: "insert into votes(score, country_id) values ($1, $2)"
        };
        async.each(votes, function(vote, callback){
            queryConfig.values = [vote.score, vote.id];
            client.query(queryConfig, function(err, result) {
                if (err) {
                    callback(err);
                }
                callback();
            })
        }, function(err){
            if (err) {
                throw err;
            }
            done();
        });
    });
}

