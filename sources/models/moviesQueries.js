/* 
 * Methodes used to manage movies table
 */

// Get Database object
let db = require('./interfaces/dbInterface'),
    url = require('url'),
    config = require('../config/config');


/***************** CRUD Movies methodes *****************/

/**
 * Get all movies with pagination
 * @param {obj} req
 * @param {obj} res
 * @param {obj} next
 * @returns {obj}
 */
function getAllMovies(req, res, next) {
    
    // Get page param from URI
    let getParams = url.parse(req.url, true).query;
    let offset = getParams.page ? parseInt(getParams.page-1): 0;

    db.Query('SELECT m.id, TRIM(m.title) as title, m.release_year, m.creation_date, m.for_kids, m.rating, string_agg(c.name, \',\') ' +
            'AS categories FROM movies AS m ' +
            'LEFT JOIN movie_has_categories AS mhc ON m.id = movie_id ' +
            'LEFT JOIN categories AS c ON category_id = c.id ' +
            'GROUP BY m.id ORDER BY m.id LIMIT $1 OFFSET $2;', [config.pagination, offset*config.pagination], config.ttl, (data) => {

                let responseCode = 200;
                if(data.length > 0) {
                    data = _formatCategories(data);
                } else {
                    responseCode = 204;
                } 
                res.status(responseCode)
                        .json({
                            status: 'success',
                            message: 'All datas successfully fetched',
                            results: data
                        });
            });
}

/**
 * GET movie by id
 * @param {obj} req
 * @param {obj} res
 * @param {obj} next
 * @returns {obj}
 */
function getMovieById(req, res, next) {
    
    // Get object ID
    let movieId = parseInt(req.params.id);
    
    db.Query('SELECT m.id, TRIM(m.title) as title, m.release_year, m.creation_date, m.for_kids, m.rating, string_agg(c.name, \',\') AS categories FROM movies AS m ' +
            'LEFT JOIN movie_has_categories AS mhc ON m.id = movie_id ' +
            'LEFT JOIN categories AS c ON category_id = c.id ' +
            'WHERE m.id = $1 GROUP BY m.id ;', movieId, config.ttl, (data) => {
                let responseCode = 200;
                if(data.length > 0) {
                    data = _formatCategories(data);
                } else {
                    responseCode = 204;
                } 
                res.status(responseCode)
                        .json({
                            status: 'success',
                            message: 'Movie ' + movieId + ' found',
                            results: data[0]
                        });
            });
}

/**
 * Used to create an entry in DB
 * @param {obj} req
 * @param {obj} res
 * @param {obj} next
 * @returns {obj}
 */
function createMovie(req, res, next) {

    // Get data sent in body
    req.body = _formatDatas(req.body);
    
    db.Any('INSERT INTO movies (id, title, release_year, creation_date, for_kids, rating) ' +
            'VALUES ((SELECT MAX (id) +1 FROM movies), ${title}, ${release_year}, NOW(), ${for_kids}, ${rating})', req.body)
            .then( (data) => {
                if (req.body.categories !== undefined) {
                    _manageMovieToCategoryRelations(req.body.categories);
                }
                db.FlushCache();
                res.status(201)
                        .json({
                            status: 'success',
                            message: 'Movie successfully added'
                        });
            })
            .catch( (err) => {
                return next(err);
            });
}

/**
 * Update an entry in DB
 * @param {obj} req
 * @param {obj} res
 * @param {obj} next
 * @returns {obj}
 */
function updateMovieById(req, res, next) {
    
    // Get object ID
    let movieId = parseInt(req.params.id);
    
    // SET vars
    let valuesToUpdate = '',
        values = new Array();

    // Get data sent in body    
    req.body = _formatDatas(req.body);
    // ... and format them for Query
    Object.keys(req.body).forEach(function (k, i) {
        if(k !== 'categories') {
            valuesToUpdate += i > 0 ? ", " : "";
            valuesToUpdate += k + "=$" + parseInt(i + 1);
            values.push(req.body[k]);
        }
    });
    
    // Categories are updated sepeartly from the rest
    if (req.body.categories !== undefined) {
        _manageMovieToCategoryRelations(req.body.categories, movieId);
        // If there is no other values to be updated flush cache
        if(valuesToUpdate === '') {
            db.FlushCache();
            res.status(200)
                    .json({
                        status: 'success',
                        message: 'Movie inserted'
                    });
        }
    }
    
    // Check if other values than categories have to be updated
    if(valuesToUpdate !== '') {
        db.Any('UPDATE movies SET ' + valuesToUpdate + ' WHERE id=' + movieId, values)
                .then( (data) => {
                    db.FlushCache();
                    res.status(200)
                            .json({
                                status: 'success',
                                message: 'Movie inserted'
                            });
                })
                .catch( (err) => {
                    return next(err);
                });
    }
}

/**
 * DELETE object from DB
 * @param {obj} req
 * @param {obj} res
 * @param {obj} next
 * @returns {obj}
 */
function deleteMovieById(req, res, next) {
    let movieId = parseInt(req.params.id);
    db.Any('DELETE FROM movies WHERE id = $1', movieId)
            .then( (data) => {
                db.FlushCache();
                res.status(200)
                        .json({
                            status: 'success',
                            message: 'Movie deleted'
                        });
            })
            .catch( (err) => {
                return next(err);
            });
}

/***************** Private methodes *****************/

/**
 * Private methode to add and update movie categories
 * @param {array} categories
 * @param {int} movieId
 */
function _manageMovieToCategoryRelations(categories, movieId) {
    
    let update = false;
    if(movieId !== undefined) { update = true; } 
    else { movieId = '(SELECT MAX (id) FROM movies)'; }
    
    let query = '';
    for (let i in categories) {
        query += i > 0 ? ", " : "";
        query += '('+ movieId +',' + categories[i] + ')';
    }
    
    if(update) {
        db.Any('DELETE FROM movie_has_categories WHERE movie_id = $1', movieId);
    }
    db.Any('INSERT INTO movie_has_categories (movie_id, category_id) VALUES ' + query);
}

/**
 * Some of the datas need to be parsed or converted
 * Also this method return only alowed keys
 * @param {obj} data
 * @returns {obj}
 */
function _formatDatas(data) {

    let validatedDatas = {};

    if (data.title !== undefined)
        validatedDatas.title = data.title.trim();
    if (data.release_year !== undefined)
        validatedDatas.release_year = parseInt(data.release_year);
    if (data.rating !== undefined)
        validatedDatas.rating = parseFloat(data.rating);
    if (data.for_kids !== undefined)
        validatedDatas.for_kids = data.for_kids === 1 ? true : false;
    if (data.categories !== undefined && typeof (data.categories === 'object')) {
        validatedDatas.categories = new Array();
        for (let i in data.categories) {
            validatedDatas.categories.push(parseInt(data.categories[i]));
        }
    }

    return validatedDatas;
}

/**
 * Used to format catégories array
 * @param {obj} data
 * @returns {obj}
 */
function _formatCategories(data) {

    Object.keys(data).forEach(function (k) {
        if (data[k].categories !== undefined && data[k].categories !== null) {
            data[k].categories = data[k].categories.split(",");
        } else {
            data[k].categories = new Array();
        }
    });
    return data;
}

/***************** Export functions *****************/
module.exports = {
    getAllMovies: getAllMovies,
    getMovieById: getMovieById,
    createMovie: createMovie,
    updateMovieById: updateMovieById,
    deleteMovieById: deleteMovieById,
};