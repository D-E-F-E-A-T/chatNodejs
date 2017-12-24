var mysql = require('mysql');
var pool = null;

function _createPool(){

	if(!process.env.NODE_ENV){
		pool = mysql.createPool({
			connectionLimit: 100,
			host: 'localhost',
			user: 'root',
			password:'',
			database: 'chatnode'
		});
	}
}

_createPool();

var connectMySQL = function(callback){
	return pool.getConnection(function(err, connection){
		if(err){
			console.log('Error getting mysql_pool connectin'+err);
			pool.end(function onEnd(error){
				if(error){
					console.log('Error on finished pool '+error);
				}

				_createPool();
			});
			return;
		}

		return callback(null, connection);
	});
};

module.exports = function(){
	return connectMySQL;
}