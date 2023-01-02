const express = require("express");
const { open } = require("sqlite");
const app = express();
const path = require("path");
const sqlite3 = require("sqlite3");
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`Db Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

// list of all movie names in the movie table
app.get("/movies/", async (request, response) => {
  const getMovieNamesQuery = `
    SELECT
      movie_name
    FROM
      movie;`;
  const moviesList = await db.all(getMovieNamesQuery);
  moviesArray = [];
  for (let each_movie of moviesList) {
    let respObj = convertDbObjectToResponseObject(each_movie);
    moviesArray.push(respObj);
  }
  response.send(moviesArray);
});

// Add Movie API
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const addMovieQuery = `
    INSERT INTO
      movie (director_id,movie_name,lead_actor)
    VALUES
      (
        6,
        "Jurassic Park",
        "Jeff Goldblum"
      );`;

  const dbResponse = await db.run(addMovieQuery);
  const movieId = dbResponse.lastID;
  response.send("Movie Successfully Added");
});

//Get movie API
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `SELECT * FROM movie WHERE movie_id = ${movieId};`;
  const movie = await db.get(getMovieQuery);
  respObject = convertDbObjectToResponseObject(movie);
  response.send(respObject);
});

//Update Movie Details Based on movieId
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  //const { directorId, movieName, LeadActor } = movieDetails;
  const updateMovieQuery = `
    UPDATE
      movie
    SET
      director_id = 24,
      movie_name = "Thor",
      lead_actor = "Christopher Hemsworth"
    WHERE
      movie_id = ${movieId};`;

  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//Delete Movie based on movieId
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM 
        movie
    WHERE 
        movie_id = ${movieId};`;

  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

const convertDirectorObjectToResponseObject = (eachDir) => {
  return {
    directorId: eachDir.director_id,
    directorName: eachDir.director_name,
  };
};

//Get Director Details
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT *
    FROM director;`;

  const directorsList = await db.all(getDirectorsQuery);
  const directorsArray = [];
  for (let eachDir of directorsList) {
    const converted = convertDirectorObjectToResponseObject(eachDir);
    directorsArray.push(converted);
  }
  response.send(directorsArray);
});

//GET Movie names Based on directorId
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesQuery = `
    SELECT movie_name
    FROM movie
    WHERE director_id = ${directorId};`;

  const movies = await db.all(getMoviesQuery);
  const moviesArray = [];
  for (let each_movie of movies) {
    let convertedMovie = convertDbObjectToResponseObject(each_movie);
    moviesArray.push(convertedMovie);
  }
  response.send(moviesArray);
});
module.exports = app;
