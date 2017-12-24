module.exports = function(app){
	var sess;
	app.get('/chat', function(req, resp){
		sess = req.session;
		if(sess.user){
			var MessageDAO = new app.infra.MessageDAO(app);
			var UserDAO = new app.infra.UserDAO(app);

			MessageDAO.readWithUser(function(err, results){
				if(err){
					console.log(err);
					resp.status(500).json(err);
				}else{
					for(var i = 0; i<results.length; i++){
						var hour = results[i].msgTime.substring(0, 2);
						var minutes = results[i].msgTime.substring(3, 5);

						var date = hour+":"+minutes;
						results[i].msgTime = date;	
					}

					resp.format({
						html: function(){
							resp.render('chat/chat', {user: sess.user, message: results});
						},
						json: function(){
							resp.status(200).json(msg);
						}
					});
				}
			});

		}else{
			resp.redirect('/');
		}
	});

	app.post('/chat/messages', function(req, resp){
		var body = req.body;
		var msg = {};
		msg.msg = body.msg;
		msg.idUser = body.idUser;

		var date = new Date();				
		var minutes = (date.getMinutes > 10)? "0"+date.getMinutes(): date.getMinutes();
		var time = date.getHours()+":"+minutes;

		msg.msgTime = time;
		body.msgTime = time;

		var MessageDAO = new app.infra.MessageDAO(app);
		MessageDAO.create(msg, function(err, results){
			if(err){
				console.log(err);
				resp.status(500).json('internal server error');
			}else{
				app.get('io').emit('message', body);
				resp.status(200).json('ok');
			}
		});
	});

	app.get('/chat/messages', function(req, resp){
		
		var MessageDAO = new app.infra.MessageDAO(app);
		MessageDAO.read(function(err, results){
			if(err){
				console.log(err);
				resp.status(500).json('internal server error');
			}else{
				resp.status(200).json(results);
			}
		});
	});
}