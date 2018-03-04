/* 
 * Methodes used to manage categories table
 */

// Get Database object
let db = require('./interfaces/dbInterface');




/***************** CRUD categories methodes *****************/

/**
 * 
 * @param {obj} req
 * @param {obj} res
 * @param {obj} next
 * @returns {obj}
 */
function getAllCategories (req, res, next) {
    db.Any('SELECT id, TRIM(name) as name FROM categories;')
        .then( (data) => {
            res.status(200)
            .json({
                status: 'success',
                message: 'All datas successfully fetched',
                results: data
            });
        })
        .catch( (err) => {
            return next(err);
        });
}


/**
 * 
 * @param {obj} req
 * @param {obj} res
 * @param {obj} next
 * @returns {obj}
 */
function getCategoryById (req, res, next) {
    let movieId = parseInt(req.params.id);
    db.Any('SELECT id, TRIM(name) FROM categories WHERE id = $1;', movieId)
        .then( (data) => {
            res.status(200)
            .json({
                status: 'success',
                message: 'Category ' + movieId + ' found',
                results: data[0]
            });
        })
        .catch( (err) => {
            return next(err);
        });
}


/**
 * 
 * @param {obj} req
 * @param {obj} res
 * @param {obj} next
 * @returns {obj}
 */
function createCategory (req, res, next) { 
    
    req.body = _formatDatas(req.body);
    db.Any('INSERT INTO categories (id, name) ' +
            'VALUES ((SELECT MAX (id) +1 FROM categories), ${name})', req.body)
        .then( (data) => {
            db.FlushCache();
            res.status(201)
            .json({
                status: 'success',
                message: 'Category successfully added'
            });
        })
        .catch( (err) => {
            return next(err);
        });
}


/**
 * 
 * @param {obj} req
 * @param {obj} res
 * @param {obj} next
 * @returns {obj}
 */
function updateCategoryById (req, res, next) { 
    let movieId = parseInt(req.params.id);
    let valuesToUpdate = '';
    let values = new Array();
    req.body = _formatDatas(req.body);
    Object.keys(req.body).forEach(function(k, i){
        valuesToUpdate += i > 0?", ":"";
        valuesToUpdate += k + "=$" + parseInt(i+1);
        values.push(req.body[k]);
    });
    
    db.Any('UPDATE categories SET ' + valuesToUpdate +' WHERE id='+movieId, values)
        .then( (data) => {
            db.FlushCache();
            res.status(200)
            .json({
                status: 'success',
                message: 'Category inserted'
            });
        })
        .catch( (err) => {
            return next(err);
        });
}


/**
 * 
 * @param {obj} req
 * @param {obj} res
 * @param {obj} next
 * @returns {obj}
 */
function deleteCategoryById (req, res, next) { 
    let movieId = parseInt(req.params.id);
    db.Any('DELETE FROM categories WHERE id = $1', movieId)
        .then( (data) => {
            db.FlushCache();
            res.status(200)
            .json({
                status: 'success',
                message: 'Category deleted'
            });
        })
        .catch( (err) => {
            return next(err);
        });
}


/***************** Private methodes *****************/

/**
 * Some of the datas need to be parsed or converted
 * Also this method return only alowed keys
 * @param {obj} data
 * @returns {obj}
 */
function _formatDatas(data) {

    let validatedDatas = {};
    
    if(data.name !== undefined)
        validatedDatas.name = data.name.trim();
    
    return validatedDatas;
}


/***************** Export functions *****************/
module.exports = {
    getAllCategories: getAllCategories, 
    getCategoryById: getCategoryById, 
    createCategory: createCategory, 
    updateCategoryById: updateCategoryById, 
    deleteCategoryById: deleteCategoryById, 
}