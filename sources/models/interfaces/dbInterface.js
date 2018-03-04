/**
 * PostgresMiddleware.js
 * 
 * Handles postgres queries and caching to redis
 * see README for usage
 * 
 */
let promise = require('bluebird'),
    config = require('../../config/config'),
    crypto = require('crypto'),
    RedisInterface = require('./RedisInterface');

let options = {
    promiseLib : promise
}
let pgp = require('pg-promise')(options),
    db = pgp(config.db);

/**
 * Execute a postgres query
 * @param {String}		query  	Querystring
 * @param {Array}		params 	Array of paramters for the query (empty array for none)
 * @param {Number}   	ttl    	Expiration of cache in seconds
 * @param {Function} 	next   	callback in the form of function(err, data)
 */
function Query(query, params, ttl, next) {

    let cache = config.cache;

    // If no time to live (ttl)  caching disabled
    if (typeof ttl !== 'number') {
        next = ttl;
        cache = false;
    }

    // Return if no callback
    if (!next)
        return console.log('YOU MUST PASS A CALL BACK TO QUERY FUNCTION!');

    // If we have caching enabled
    // Check and see if we have a cache in redis
    if (cache) {

        let hash = crypto.createHash('sha1').update(query + params.toString()).digest('hex');

        RedisInterface.getQueryCache(hash, (err, data) => {
            if (err || !data) {
                _execute(query, params, ttl, cache, (data) => {
                    return next(data);
                });
            } else {
//                console.log("results from cache");
                return next(data);
            }
        });

    } else {
        _execute(query, params, ttl, cache, (data) => {
            return next(data);
        });
    }

}

function FlushCache() {
    RedisInterface.flushDb();
}

/**
 * 
 * @param {string} query
 * @param {multi} params
 * @param {int} ttl
 * @param {boolean} cache
 * @param {obj} next
 * @returns {obj}
 */
function _execute(query, params, ttl, cache, next) {

    let hash = crypto.createHash('sha1').update(query + params.toString()).digest('hex');

    db.any(query, params)
            .then( (data) => {
                // If Caching set cache in redis
//                console.log("query excuted in DB");
                if (cache) {
                    RedisInterface.setQueryCache(hash, ttl, data, (err, data) => {
                        if (err || !data)
                            console.log("ERROR : " + err.message);
                    });
                    return next(data);
                } else {
                    return next(data);
                }
            })
            .catch( (err) => {
                return next(err);
            });
    
}

module.exports = {
    Query: Query,
    FlushCache: FlushCache,
    Any: db.any
};