
/*
 * GET voting page
 */

var countries = {"1" : "Country1", 
                "2" : "Country2", 
                "3" : "Country3", 
                "4" : "Country4", 
                "5" : "Country5",
                "6" : "Country6",
                "7" : "Country7",
                "8" : "Country8",
                "9" : "Country9",
                "10" : "Country10",
                "11" : "Country11",
                "12" : "Country12",
                "13" : "Country13",
                "14" : "Country14",
                "15" : "Country15"};

exports.display = function(req, res){
    res.render('vote', {title: 'Vote', 
                        navbarActive : 'Vote',
                        countries : countries});
};
