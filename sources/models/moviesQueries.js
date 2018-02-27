/* 
 * Methodes used to manage movies table
 */

// Get Database object
let db = require('./db/dbConnector');
let url = require('url');
let config = require('../config/config');

/**
 * Some of the datas need to be parsed or converted
 * Also this method return only alowed keys
 * @param {obj} data
 * @returns {obj}
 */
function formatDatas(data) {

    var validatedDatas = {};

    if (data.title != undefined)
        validatedDatas.title = data.title.trim();
    if (data.release_year != undefined)
        validatedDatas.release_year = parseInt(data.release_year);
    if (data.rating != undefined)
        validatedDatas.rating = parseFloat(data.rating);
    if (data.for_kids != undefined)
        validatedDatas.for_kids = data.for_kids == 1 ? true : false;
    if (data.categories != undefined && typeof (data.categories == 'object')) {
        validatedDatas.categories = new Array();
        for (var i in data.categories) {
            validatedDatas.categories.push(parseInt(data.categories[i]));
        }
    }

    return validatedDatas;
}

function formatCategories(data) {

    Object.keys(data).forEach(function (k) {
        if (data[k].categories !== undefined && data[k].categories !== null) {
            data[k].categories = data[k].categories.split(",");
        } else {
            data[k].categories = new Array();
        }
    });
    return data;
}

/**
 * Following function are all the queries :
 * SELECT ALL   (get)       /api/movies
 * SELECT ONE   (get)       /api/movies/:id
 * INSERT       (post)      /api/movies 
 * UPDATE       (put)       /api/movies/:id
 * DELETE       (delete)    /api/movies/:id
 */

function getAllMovies(req, res, next) {
    var getParams = url.parse(req.url, true).query;
    var offset = getParams.page ? parseInt(getParams.page-1): 0;

    db.any('SELECT m.*, string_agg(c.name, \',\') AS categories FROM movies AS m ' +
            'LEFT JOIN movie_has_categories AS mhc ON m.id = movie_id ' +
            'LEFT JOIN categories AS c ON category_id = c.id ' +
            'GROUP BY m.id ORDER BY m.id LIMIT $1 OFFSET $2;', [config.pagination, offset*config.pagination])
            .then(function (data) {
                var responseCode = 200;
                if(data.length > 0) {
                    data = formatCategories(data);
                } else {
                    responseCode = 204;
                } 
                res.status(responseCode)
                        .json({
                            status: 'success',
                            message: 'All datas successfully fetched',
                            results: data,
                        });
            })
            .catch(function (err) {
                return next(err);
            });
}
function getMovieById(req, res, next) {
    var movieId = parseInt(req.params.id);
    db.any('SELECT m.*, string_agg(c.name, \',\') AS categories FROM movies AS m ' +
            'LEFT JOIN movie_has_categories AS mhc ON m.id = movie_id ' +
            'LEFT JOIN categories AS c ON category_id = c.id ' +
            'WHERE m.id = $1 GROUP BY m.id ;', movieId)
            .then(function (data) {
                var responseCode = 200;
                if(data.length > 0) {
                    data = formatCategories(data);
                } else {
                    responseCode = 204;
                } 
                res.status(responseCode)
                        .json({
                            status: 'success',
                            message: 'Movie ' + movieId + ' found',
                            results: data[0],
                        });
            })
            .catch(function (err) {
                return next(err);
            });
}
function createMovie(req, res, next) {

    req.body = formatDatas(req.body);
    db.any('INSERT INTO movies (id, title, release_year, creation_date, for_kids, rating) ' +
            'VALUES ((SELECT MAX (id) +1 FROM movies), ${title}, ${release_year}, NOW(), ${for_kids}, ${rating})', req.body)
            .then(function (data) {
                if (req.body.categories != undefined) {
                    _manageMovieToCategoryRelations(req.body.categories);
                } 
                res.status(201)
                        .json({
                            status: 'success',
                            message: 'Movie successfully added'
                        });
            })
            .catch(function (err) {
                return next(err);
            });
}
function updateMovieById(req, res, next) {
    var movieId = parseInt(req.params.id);
    var valuesToUpdate = '';
    var values = new Array();
    req.body = formatDatas(req.body);
    Object.keys(req.body).forEach(function (k, i) {
        if(k != 'categories') {
            valuesToUpdate += i > 0 ? ", " : "";
            valuesToUpdate += k + "=$" + parseInt(i + 1);
            values.push(req.body[k]);
        }
    });

    db.any('UPDATE movies SET ' + valuesToUpdate + ' WHERE id=' + movieId, values)
            .then(function (data) {
                if (req.body.categories != undefined) {
                    _manageMovieToCategoryRelations(req.body.categories, movieId);
                }
                res.status(200)
                        .json({
                            status: 'success',
                            message: 'Movie inserted'
                        });
            })
            .catch(function (err) {
                return next(err);
            });
}
function deleteMovieById(req, res, next) {
    var movieId = parseInt(req.params.id);
    db.any('DELETE FROM movies WHERE id = $1', movieId)
            .then(function (data) {
                res.status(200)
                        .json({
                            status: 'success',
                            message: 'Movie deleted'
                        });
            })
            .catch(function (err) {
                return next(err);
            });
}

/**
 * Private methode to add and update movie categories
 * @param {array} categories
 * @param {int} movieId
 */
function _manageMovieToCategoryRelations(categories, movieId) {
    
    var update = false;
    if(movieId !== undefined) { update = true; } 
    else { movieId = '(SELECT MAX (id) FROM movies)'; }
    
    var query = '';
    for (var i in categories) {
        query += i > 0 ? ", " : "";
        query += '('+ movieId +',' + categories[i] + ')';
    }
    
    if(update) {
        db.any('DELETE FROM movie_has_categories WHERE movie_id = $1', movieId);
    }
    db.any('INSERT INTO movie_has_categories (movie_id, category_id) VALUES ' + query);
}
// Export functions
module.exports = {
    getAllMovies: getAllMovies,
    getMovieById: getMovieById,
    createMovie: createMovie,
    updateMovieById: updateMovieById,
    deleteMovieById: deleteMovieById,
}