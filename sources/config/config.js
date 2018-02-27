/* 
 * Use this file to put your configuration informations
 * 
 */

var pagination = 2;

var db = {};
db.host       = 'localhost';
db.port       = 5432;
db.database   = 'catalog';
db.user       = 'postgres';
db.password   = 'root';

module.exports = {
    db : db,
    pagination : pagination
}
