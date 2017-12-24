function UserDAO(app){
	this.__app = app;
}

UserDAO.prototype.create = function(user, callback){
	this.__app.infra.connectionFactory(function(err, connection){
		connection.query('INSERT INTO user SET ?', user, function(erros, results){
			connection.release();
			callback(erros, results);
		});
	});
}

UserDAO.prototype.read = function(callback){
	this.__app.infra.connectionFactory(function(err, connection){
		connection.query('SELECT * FROM user', function(erros, results){
			connection.release();
			callback(erros, results);
		});
	})
}

UserDAO.prototype.update = function(user, callback){
	this.__app.infra.connectionFactory(function(err, connection){
		connection.query("UPDATE user SET ? WHERE id = ?", [user, user.id], function(erros, results){
			connection.release();
			callback(erros, results);
		});
	});
}

UserDAO.prototype.delete = function(id, callback){
	this.__app.infra.connectionFactory(function(err, connection){
		connection.query('DELETE FROM user WHERE id = ?', id, function(erros, results){
			connection.release();
			callback(erros, results);
		});
	});
}

UserDAO.prototype.findById = function(id, callback){
	this.__app.infra.connectionFactory(function(err, connection){
		connection.query('SELECT * FROM user WHERE id = ?', [id], function(erros, results){
			connection.release();
			callback(erros, results);
		});
	});
}

UserDAO.prototype.login = function(user, callback){
	this.__app.infra.connectionFactory(function(err, connection){
		connection.query('SELECT * FROM user WHERE nick = ? AND password = ?', [user.nick, user.password], function(erros, results){
			connection.release();
			callback(erros, results);
		});
	});
}

module.exports = function(){
	return UserDAO;
}