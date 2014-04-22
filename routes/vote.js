
/*
 * GET voting page
 */

var pg = require('pg');

var connUrl = process.env.DATABASE_URL || "pg://myuser:password@localhost:5432/eurovision";

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


function insertVote(position, countryArray)
{
    pg.connect(connUrl, function(err, client, done)
    {
        if (err)
        {
            return console.error("Error getting a connection", err);
        }
        console.log("Score = " + score(position) + ", country_id = " + JSON.stringify(countryArray[position]));
        client.query({
            text : "insert into votes(score, country_id) values ($1, $2)",
            values : [score(position), parseInt(countryArray[position].id)],
            name : "insertScore"},
            function(err, result)
        {
            if (err)
            {
                return console.error("Error performing query", err);
            }
            done();
            if (position < 9 && position < countryArray.length - 1)
            {
                insertVote(position + 1, countryArray);
            }
        });
    });
}

exports.submit = function(req, res)
{
    insertVote(0, req.body.countries);

    console.log("Vote submitted");
};


function score(position)
{
    if (position === 0)
    {
        return 12;
    }
    else if (position === 1)
    {
        return 10;
    }
    else
    {
        return Math.max(10 - position, 0);
    }
}
