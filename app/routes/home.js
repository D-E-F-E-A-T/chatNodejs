module.exports = function(app){
	var sess;
	app.get('/', function(req, resp){
		sess = req.session;
		if(!sess.user){
			resp.render('home/index');
		}else{
			resp.redirect('/chat');
		}
	});
}