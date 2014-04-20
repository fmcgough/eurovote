
/*
 * GET voting page
 */

var pg = require('pg');

var connUrl = "pg://myuser:password@localhost:5432/eurovision";

var countries;

exports.display = function(req, res)
{
    pg.connect(connUrl, function(err, client, done)
    {
        if (err)
        {
            return console.error("Error getting a connection", err);
        }
        client.query("select id, name from countries", function(err, result)
        {
            done();
            if (err)
            {
                return console.error("Error performing query", err);
            }
            res.render('vote', {title: 'Vote',
                        navbarActive : 'Vote',
                        countries : result.rows});
        });
    });
};

exports.submit = function(req, res)
{
    console.log("Vote submitted");
};
