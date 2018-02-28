# NodeRESTAPI

Basic REST API to manage movies & catégories. Introduction to NodeJs & PostgreSQL.

### Prerequisites

Make sure to load the following dependencies

```
express
bluebird
nodemon
body-parser
nodemon
```

### Installing

Download sources, run npm install you can then install database running `buildDbCatalog.sql`
When done you're ready to go.

```
> npm install
> npm run start
```

### METHODE AVAILABLE :

> movies
```
// GET all movies (paginated)
/api/movies
// GET on movie by id
/api/movies/:id
// POST Add a new movie
/api/movies/
// Data and format required :
{
    "title":String,
    "release_year":Int,
    "for_kids":Boolean,
    "rating":Float, // max 10,
    "categories":Array // Example : [1, 2, 5]
}
// DELETE movie by id
/api/movies/:id
```
> Categories
```
// GET all categories
/api/categories
// GET on categorie by id
/api/categories/:id
// POST Add a new categories
/api/categories/
// Data and format required :
{
    "name":String,
}
// DELETE categories by id
/api/categories/:id
```

## Built With

* [NodeJS](https://nodejs.org/en/) - an open-source, cross-platform JavaScript run-time environment for executing JavaScript code server-side. 

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags). 

## Authors

* **Noumcreation** - *From an original idea of* - [GH-DG]

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

* Thank you for the chalenge !
* First ever built NodeJS API ( ... and still a long way to go!)