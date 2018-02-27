/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


let promise = require('bluebird');
let config = require('../../config/config');

var options = {
    promiseLib : promise
}

var pgp = require('pg-promise')(options);
var db = pgp(config.db);

module.exports = db;