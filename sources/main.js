/* 
 * Base file for CRUD REST API
 */

let express = require('express');
let bodyParser = require('body-parser');
let moviesDb = require('./models/moviesQueries')
let categoriesDb = require('./models/categoriesQueries')

let app = express();
let router = express.Router();


// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// Router configuration
router.get('/', (request, response) => {
    response.send('My API');
});
// Movies 
router.get('/api/movies', moviesDb.getAllMovies);
router.get('/api/movies/:id',  moviesDb.getMovieById);
router.post('/api/movies', moviesDb.createMovie);
router.put('/api/movies/:id', moviesDb.updateMovieById);
router.delete('/api/movies/:id', moviesDb.deleteMovieById);

// Categories 
router.get('/api/categories', categoriesDb.getAllCategories);
router.get('/api/categories/:id',  categoriesDb.getCategoryById);
router.post('/api/categories', categoriesDb.createCategory);
router.put('/api/categories/:id', categoriesDb.updateCategoryById);
router.delete('/api/categories/:id', categoriesDb.deleteCategoryById);



// Server instance
app.use(router);
app.listen(8080);