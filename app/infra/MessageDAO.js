function MessageDAO(app){
	this.__app = app;
}

MessageDAO.prototype.create = function(msg, callback){
	this.__app.infra.connectionFactory(function(err, connection){
		connection.query('INSERT INTO message SET ?', msg, function(erros, results){
			connection.release();
			callback(erros, results);
		});
	});
}

MessageDAO.prototype.read = function(callback){
	this.__app.infra.connectionFactory(function(err, connection){
		connection.query('SELECT * FROM message', function(err, results){
			connection.release();
			callback(err, results);
		});
	});
}

MessageDAO.prototype.readWithUser = function(callback){
	this.__app.infra.connectionFactory(function(err, connection){
		connection.query('SELECT * FROM user INNER JOIN message ON user.id = message.idUser;', function(err, results){
			connection.release();
			callback(err, results);
		});
	});
}

module.exports = function(){
	return MessageDAO;
}