
/*
 * GET home page.
 */

var pg = require('pg');
var connUrl = "pg://myuser:password@localhost:5432/eurovision";

exports.index = function(req, res){
    pg.connect(connUrl, function(err, client, done)
    {
        if (err)
        {
            return console.error("Error getting a connection", err);
        }
        client.query("select sum(v.score) as score,"
                      + "c.name as country "
                      + "from "
                      + "votes v join countries c on c.id = v.country_id "
                      + "group by c.id "
                      + "order by score desc", function(err, result)
        {
            done();
            if (err)
            {
                return console.error("Error performing query", err);
            }
            res.render('index', {title: 'Eurovision 2014',
                        navbarActive : 'Home',
                        results : result.rows});
        });
    });
};
