
/*
 * GET voting page
 */

exports.display = function(req, res){
  res.render('vote', {title: 'Vote', navbarActive : 'Vote'});
};
