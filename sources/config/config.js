/* 
 * Use this file to put your configuration informations
 * 
 */

let db = {};
db.user       = 'postgres';
db.password   = 'root';
db.host       = '192.168.99.100';
db.port       = 5432;
db.database   = 'catalog';

let redis = {};
redis.host       = '192.168.99.100';
redis.port       = 6379;

let cache = true;
let ttl = 15;
let pagination = 20;

module.exports = {
    db : db,
    ttl : ttl,
    cache : cache,
    redis : redis,
    pagination : pagination
}
