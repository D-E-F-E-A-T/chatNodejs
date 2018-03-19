const crypto = require('crypto');
module.exports = function(app){
	var sess;


	/*	Route used to list all users
	*   return json with a list of all users in database
	*/
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

	/*
	* Route used to get a single user
	* This only works if there are session (user logged)
	* return json that contain the infos of the user
	* params id of user (example: 1543)
	*/
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
	
	/*
	* Route used to create a new user
	* returns the data created, links of possibilities and redirect the user if is HTML for homepage
	*
	*/
	app.post('/users/user', function(req, resp){
		var body = req.body;
	
		var authKey = body.keyAuth;

		var locksmithClient = new app.services.locksmithClient();
		locksmithClient.useKey(authKey, function(exception, request, result, returned){

			if(result.statusCode == 404){
				resp.format({
					html: function(){
						resp.status(403).redirect('/cadastro');
					},
					json: function(){
						resp.status(403).json('key not found');
					}
				});
			}else{
				var user = {
					nick: body.nick,
					password: body.password
				}
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
			}
		});
	});


	/*
	* route used to update the user
	*
	*/
	app.put('/users/user/:id', function(req, resp){
		var user = req.body;
		
		var UserDAO = new app.infra.UserDAO(app);
	
		if(user.oldPass == undefined){
			UserDAO.update(user, function(err, result){	
				if(err){
					console.log(err);
					resp.format({
						html: function(){
							resp.render('erros/500');
						},
						json: function(){
							resp.status(500).json('error');
						}
					});
				}else{
					resp.format({
						html: function(){
							resp.redirect('/users/logout/'+id);
						},
						json: function(){
							resp.status(200).json('ok');
						}
					});
				}
			});
			
		}else{
			var oldPass = user.oldPass;
			var oldPassHash = user.oldHash;

			const hash = crypto.createHash('sha256');

			hash.on('readable', function(){
				const data = hash.read();
				if(data){
					oldPass = data.toString('hex');
				
				}
			});
	
			hash.write(oldPass);
			hash.end();

			if(oldPass == oldPassHash){
				const hashNewPass = crypto.createHash('sha256');
				hashNewPass.on('readable', function(){
					const data = hashNewPass.read();
					if(data){
						user.password = data.toString('hex');
					}
				});
		
				hashNewPass.write(user.password);
				hashNewPass.end();

				var userUpdate = {
					id: user.id,
					password: user.password,
					nick: user.nick
				}
				UserDAO.update(userUpdate, function(err, result){	
					if(err){
						console.log(err);
						resp.format({
							html: function(){
								resp.render('erros/500');
							},
							json: function(){
								resp.status(500).json('error');
							}
						});
					}else{
						resp.format({
							html: function(){
								resp.redirect('/users/logout/'+id);
							},
							json: function(){
								resp.status(200).json('ok');
							}
						});
					}
				});
			}else{
				resp.format({
					html: function(){
						resp.status(406).send();
					},
					json: function(){
						resp.status(406).json('wrong pass');
					}
				});
			}
		}
	});


	/*
	* route used to delete any user whe pass id
	* return the result of the query
	*/
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

	/*
	* route used to make login of any user
	*/
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


	/*
	* Route used to make logout of any user
	*/
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
