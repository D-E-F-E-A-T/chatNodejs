var restify = require('restify-clients');

function locksmithClient(){
	this._client = restify.createJsonClient({
		url: 'http://localhost:3001'
	});
}

locksmithClient.prototype.useKey = function(key, callback){
	this._client.get('/keys/key/'+key, callback);
}

module.exports = function(){
	return locksmithClient;
}