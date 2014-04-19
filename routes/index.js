
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Eurovision 2014', navbarActive: 'Home' });
};
