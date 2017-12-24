module.exports = function(app){
	app.get('/cadastro', function(req, resp){
		resp.render('cadastro/cadastre');
	});
}