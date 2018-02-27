/* 
 * Methodes used to manage categories table
 */

// Get Database object
let db = require('./db/dbConnector');


/**
 * Some of the datas need to be parsed or converted
 * Also this method return only alowed keys
 * @param {obj} data
 * @returns {obj}
 */
function formatDatas(data) {

    var validatedDatas = {};
    
    if(data.name != undefined)
        validatedDatas.name = data.name.trim();
    
    return validatedDatas;
}


/**
 * Following function are all the queries :
 * SELECT ALL   (get)       /api/categories
 * SELECT ONE   (get)       /api/categories/:id
 * INSERT       (post)      /api/categories 
 * UPDATE       (put)       /api/categories/:id
 * DELETE       (delete)    /api/categories/:id
 */
function getAllCategories (req, res, next) {
    db.any('SELECT * FROM categories;')
        .then(function(data) {
            res.status(200)
            .json({
                status: 'success',
                message: 'All datas successfully fetched',
                results: data,
            });
        })
        .catch(function(err) {
            return next(err);
        });
}
function getCategoryById (req, res, next) {
    var movieId = parseInt(req.params.id);
    db.any('SELECT * FROM categories WHERE id = $1;', movieId)
        .then(function(data) {
            res.status(200)
            .json({
                status: 'success',
                message: 'Category ' + movieId + ' found',
                results: data[0],
            });
        })
        .catch(function(err) {
            return next(err);
        });
}
function createCategory (req, res, next) { 
    
    req.body = formatDatas(req.body);
    db.any('INSERT INTO categories (id, name) ' +
            'VALUES ((SELECT MAX (id) +1 FROM categories), ${name})', req.body)
        .then(function(data) {
            res.status(201)
            .json({
                status: 'success',
                message: 'Category successfully added'
            });
        })
        .catch(function(err) {
            return next(err);
        });
}
function updateCategoryById (req, res, next) { 
    var movieId = parseInt(req.params.id);
    var valuesToUpdate = '';
    var values = new Array();
    req.body = formatDatas(req.body);
    Object.keys(req.body).forEach(function(k, i){
        valuesToUpdate += i > 0?", ":"";
        valuesToUpdate += k + "=$" + parseInt(i+1);
        values.push(req.body[k]);
    });
    
    db.any('UPDATE categories SET ' + valuesToUpdate +' WHERE id='+movieId, values)
        .then(function(data) {
            res.status(200)
            .json({
                status: 'success',
                message: 'Category inserted'
            });
        })
        .catch(function(err) {
            return next(err);
        });
}
function deleteCategoryById (req, res, next) { 
    var movieId = parseInt(req.params.id);
    db.any('DELETE FROM categories WHERE id = $1', movieId)
        .then(function(data) {
            res.status(200)
            .json({
                status: 'success',
                message: 'Category deleted'
            });
        })
        .catch(function(err) {
            return next(err);
        });
}


module.exports = {
    getAllCategories: getAllCategories, 
    getCategoryById: getCategoryById, 
    createCategory: createCategory, 
    updateCategoryById: updateCategoryById, 
    deleteCategoryById: deleteCategoryById, 
}