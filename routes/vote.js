
/*
 * GET voting page
 */

var pg = require('pg');
var idx = require('./index');

var connUrl = process.env.DATABASE_URL || "pg://ev_user:fabulous@localhost:5432/eurovision";

var countries;

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
    console.log("Votes: " + JSON.stringify(req.body.votes));

    insertVotes(req.body.votes);

    console.log("Vote submitted");
};

function insertVotes(votes) {
    pg.connect(connUrl, function(err, client, done) {
        if (err) {
            throw err;
        }

        insertVote(0, votes, client, done);
    });
}

function insertVote(position, votes, client, done) {
    var vote = votes[position];
    client.query({
        text : "insert into votes(score, country_id) values ($1, $2)",
        values : [vote.score, vote.id],
        name : "insertScore"
    }, function(err, result) {
        if (err) {
            throw err;
        }

        position++;
        if (position < votes.length) {
            insertVote(position, votes, client, done);
        } else {
            done();
        }
    });
}

