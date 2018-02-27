/**
 * CREATE DB `catalog` with 3 tables 
 * and a few datas to get started.
 *
 * Author:  Noumcreation
 * Created: 25 févr. 2018
 */

DROP DATABASE IF EXISTS catalog;
CREATE DATABASE catalog;

\c catalog;

CREATE TABLE movies
(
  id integer NOT NULL,
  title character(255) NOT NULL,
  release_year integer,
  creation_date timestamp with time zone NOT NULL,
  for_kids boolean NOT NULL DEFAULT false,
  rating numeric(4,2) NOT NULL,
  CONSTRAINT movies_pkey PRIMARY KEY (id)
);

CREATE TABLE categories
(
  id integer NOT NULL,
  name character(255) NOT NULL,
  CONSTRAINT categories_pkey PRIMARY KEY (id)
);

CREATE TABLE public.movie_has_categories
(
  movie_id integer NOT NULL,
  category_id integer NOT NULL,
  CONSTRAINT fk_categories FOREIGN KEY (category_id)
      REFERENCES public.categories (id) MATCH SIMPLE
      ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_movies FOREIGN KEY (movie_id)
      REFERENCES public.movies (id) MATCH SIMPLE
      ON UPDATE CASCADE ON DELETE CASCADE
)

-- Add CATEGORIES
INSERT INTO categories (id, name)
VALUES  (1,'Action'),
        (2,'Aventure'),
        (3,'Animation'),
        (4,'Comédie'),
        (5,'Crime'),
        (6,'Documentaire'),
        (7,'Drame'),
        (8,'Familial'),
        (9,'Fantastique'),
        (10,'Histoire'),
        (11,'Horreur'),
        (12,'Musique'),
        (13, 'Mystère'),
        (14,'Romance'),
        (15,'Science-Fiction'),
        (16,'Téléfilm'),
        (17,'Thriller'),
        (18,'Guerre'),
        (19,'Western');

-- ADD MOVIES
INSERT INTO movies (id, title, release_year, creation_date, for_kids, rating) 
VALUES  (1,'Descendants 2',2017,NOW(),false,7.4),
        (2,'Le Roi lion',1994,NOW(),true,8),
        (3,'Raiponce : Moi, J''ai un rêve',2017,NOW(),true,6.4),
        (4,'La Reine des Neiges : Joyeuses fêtes avec Olaf',2017,NOW(),true,5.9);

-- ADD RELATIONS
INSERT INTO movie_has_categories (movie_id, category_id) 
VALUES  (1,3),(1,8),
        (2,3),(2,8),
        (3,3),(3,8),
        (4,3),(4,8);
