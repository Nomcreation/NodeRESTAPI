/* 
 * Made to handle caching of all PGSQL request
 */
let config = require('../../config/config');

let redis = require("redis"), client = redis.createClient(config.redis);

redis.debug = true;

client.on("error", (err) => {
	console.log("Error " + err);
});

function getQueryCache(key, next) {
	client.get('postgres:' + key, (err, result) => {
		//console.log(err, result);
		if (err || !result) return next(err);
		return next(null, JSON.parse(result));
	});
}

function setQueryCache(key, ttl, data, next) {
	//console.log(key);
	client.setex('postgres:' + key, ttl, JSON.stringify(data), (err, result) => {
		if (err || !result) return next(err);
		return next(null, result);
	});
}

/**
 * Used to force new Query after UPDATE, DELETE, INSERT
 */
function flushDb() {
	client.flushdb();
//        console.log('FLUSHED');
}

module.exports = {
	getQueryCache: getQueryCache,
	setQueryCache: setQueryCache,
        flushDb: flushDb
};