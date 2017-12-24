const crypto = require('crypto');
module.exports = function(app){
	var sess;

	app.get('/users', function(req, resp){
		var UserDAO = new app.infra.UserDAO(app);
		UserDAO.read(function(erros, results){
			if(erros){
				console.log(erros);
				resp.format({
					html: function(){
						resp.render('erros/500');
					},
					json: function(){
						resp.status(500).json(error);
					}
				});
			}else{
				resp.format({
					html: function(){
						resp.json(results);
					},
					json: function(){
						resp.status(200).json(results);
					}
				});
			}
		});
	});

	app.get('/users/user/:id', function(req, resp){
		var id = req.params.id;

		sess = req.session;
		var userLogged = sess.user;
		if(userLogged){

			var UserDAO = new app.infra.UserDAO(app);
			UserDAO.findById(id, function(erros, results){
				if(erros){
					console.log(erros);
					resp.format({
						html: function(){
							resp.render('erros/500');
						},
						json: function(){
							resp.status(500).json(erros);
						}
					});
				}else{
					resp.format({
						html: function(){
							resp.render('users/user-profile', {user: userLogged, finded: results});
						},
						json:function(){
							resp.status(200).json(results);
						}
					});
				}
			});
		}else{
			resp.redirect('/');
		}
	});
	
	app.post('/users/user', function(req, resp){
		var user = req.body;

		req.assert('nick', 'Nickname obrigatorio!').notEmpty();
		req.assert('password', 'Senha obrigatoria').notEmpty();


		const hash = crypto.createHash('sha256');
		
		hash.on('readable', function(){
			const data = hash.read();
			if(data){
				user.password = data.toString('hex');
			
			}
		});

		hash.write(user.password);
		hash.end();
				

		var errors = req.validationErrors();
		if(errors){
			resp.format({
				html: function(){
					resp.status(400).render('cadastro/cadastre', {validationErrors: errors, user: user});
				},
				json: function(){
					resp.status(400).json(errors);
				}
			});

			return;
		}else{
			var UserDAO = new app.infra.UserDAO(app);
			UserDAO.create(user, function(erros, results){
				user.id = results.insertId;

				var response = {
					user: user,
					links: [
						{
							href: "http://localhost:3000/users/user/"+user.id,
							method: "GET"
						},
						{
							href: "http://localhost:3000/users/user/"+user.id,
							rel:"update",
							method:"PUT"
						},
						{
							href: "http://localhost:3000/users/user/"+user.id,
							rel:"delete",
							method:"DELETE"
						}
					]
				}

				resp.format({
					html: function(){
						resp.redirect('/');
					},
					json: function(){
						resp.status(201).json(response);
					}
				});
			});
		}
	});

	app.put('/users/user/:id', function(req, resp){
		var user = req.params;
		user.id = req.params.id;

		var UserDAO = new app.infra.UserDAO(app);
		UserDAO.update(user, function(err, result){
			if(err){
				resp.format({
					html: function(){
						resp.render('erros/500');
					},
					json: function(){
						resp.status(500).json(err);
					}
				});
			}else{
				resp.format({
					html: function(){
						resp.redirect('/users/logout/'+id);
					},
					json: function(){
						resp.status(204).render();
					}
				})
			}
		});
	});

	app.delete('/users/user/:id', function(req, resp){
		var id = req.params.id;

		var UserDAO = new app.infra.UserDAO(app);
		UserDAO.delete(id, function(err, result){
			if(err){
				console.log(err);
				resp.format({
					html: function(){
						resp.render('erros/500');
					},
					json: function(){
						resp.status(500).json(err);
					}
				});
			}else{
				
				resp.format({
					html: function(){
						resp.json(result);
					},
					json: function(){
						resp.status(204).json(result);
					}
				});
			}
		});
	});

	
	app.post('/users/login', function(req, resp){
		var user = req.body;
		var UserDAO = new app.infra.UserDAO(app);
		sess=req.session;
				
		const hash = crypto.createHash('sha256');

		hash.on('readable', function(){
			const data = hash.read();
			if(data){
				user.password = data.toString('hex');
			
			}
		});

		hash.write(user.password);
		hash.end();
		
		UserDAO.login(user, function(err, results){
			if(err){
				resp.format({
					html: function(){
						resp.render('erros/500');
					},
					json: function(){
						resp.status(500).json(err);
					}
				});
			}else{
				if(results != ""){
					sess.user= results;

					app.get('io').emit('userLogin', results[0].nick);
					resp.format({
						html: function(){
							resp.redirect('/chat');
						},
						json: function(){
							resp.status(200).json(results);
						}
					});
				}else{
					resp.format({
						html: function(){
							resp.redirect('/');
						},
						json: function(){
							resp.status(400).json(results);
						}
					});
				}
			}
		});
	});

	app.get('/users/logout/:id', function(req, resp){
		sess = req.session;
		if(sess.user){
			var user = sess.user;
			if(req.params.id != ""){
				req.session.destroy(function(err){
					if(err){
						console.log(err);
						resp.format({
							html: function(){
								resp.render('erros/500');
							},
							json: function(){
								resp.status(500).json(err);
							}
						});
					}else{
						app.get('io').emit('userLogout', user[0].nick);
						
						resp.format({
							html: function(){
								resp.redirect('/');
							},
							json: function(){
								resp.status(204).json();
							}
						});
					}
				});
			}else{
				resp.redirect('/');
			}
		}else{
			resp.redirect('/');
		}
	});
}
