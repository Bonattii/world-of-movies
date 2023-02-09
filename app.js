const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Allow to use environment variables
dotenv.config();

const app = express();

const filterDataArray = [];
const filterMovieDataArray = [];
const filterSeriesDataArray = [];
let fetchedData = false;

// Config app to use EJS
app.set('view engine', 'ejs');

// Allow the req.body to be used
app.use(bodyParser.urlencoded({ extended: true }));

// Allow the server to run static files
app.use(express.static('public'));

// GET localhost:3000/
app.get('/', async (req, res) => {
  // Garantee that the data don't get fetch again, and show duplicates on the frontEnd
  if (fetchedData) {
    res.render('index', { filterSeriesDataArray, filterMovieDataArray });
    return;
  }
  // Fetch newer movies and series data to show on the frontPage
  try {
    const moviesData = await fetch(
      `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1`
    );
    const seriesData = await fetch(
      `https://api.themoviedb.org/3/discover/tv?api_key=${process.env.API_KEY}&language=en-US&sort_by=popularity.desc&page=1`
    );

    // Transform the movies data into a json and filter
    const jsonMoviesData = await moviesData.json();

    jsonMoviesData.results.slice(0, 10).map(result =>
      filterMovieDataArray.push({
        title: result.title,
        poster: result.poster_path,
        description: result.overview,
        releaseDate: result.release_date
      })
    );

    // Transform the series data into a json and filter
    const jsonSeriesData = await seriesData.json();

    jsonSeriesData.results.slice(0, 10).map(result =>
      filterSeriesDataArray.push({
        title: result.name,
        poster: result.poster_path,
        description: result.overview,
        releaseDate: result.first_air_date
      })
    );

    fetchedData = true;
  } catch (error) {
    console.log(error);
  }

  res.render('index', { filterSeriesDataArray, filterMovieDataArray });
});

// POST localhost:3000/
app.post('/', async (req, res) => {
  const userQueryFullString = req.body.userQuery;
  const userQueryWithPlusSign = userQueryFullString.replace(/ /g, '+');
  const userQueryWithPlusSignLower = userQueryWithPlusSign.toLowerCase();
  const userChoice = req.body.seriesOrMovie;
  let typeQuery = '';

  try {
    // Based on user choice, the fetch url will change for tv or movie
    if (userChoice === 'series') {
      typeQuery = 'tv';
    } else {
      typeQuery = 'movie';
    }

    const data = await fetch(
      `https://api.themoviedb.org/3/search/${typeQuery}?api_key=${process.env.API_KEY}&query=${userQueryWithPlusSignLower}`
    );

    const jsonData = await data.json();

    // Tv and Movie have different properties name
    if (userChoice === 'series') {
      jsonData.results.map(result =>
        filterDataArray.push({
          title: result.name,
          poster: result.poster_path,
          description: result.overview,
          releaseDate: result.first_air_date
        })
      );
    } else {
      jsonData.results.map(result =>
        filterDataArray.push({
          title: result.title,
          poster: result.poster_path,
          description: result.overview,
          releaseDate: result.release_date
        })
      );
    }

    res.redirect('/results');
  } catch (error) {
    console.log(error);
  }
});

// GET localhost:3000/results
app.get('/results', (req, res) => {
  res.render('results', { filterDataArray });
});

// Makes app ready to run on production too
app.listen(process.env.PORT || 3000, () =>
  console.log('Server running on port 3000')
);

module.exports = app;
