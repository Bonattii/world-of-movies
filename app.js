const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Allow to use environment variables
dotenv.config();

const app = express();

const moviesGenresList = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 10770, name: 'TV Movie' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' }
];

const seriesGenresList = [
  { id: 10759, name: 'Action & Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 10762, name: 'Kids' },
  { id: 9648, name: 'Mystery' },
  { id: 10763, name: 'News' },
  { id: 10764, name: 'Reality' },
  { id: 10765, name: 'Sci-Fi & Fantasy' },
  { id: 10766, name: 'Soap' },
  { id: 10767, name: 'Talk' },
  { id: 10768, name: 'War & Politics' },
  { id: 37, name: 'Western' }
];

let filterDataArray = [];
let filterGenreArray = [];
let filterMovieDataArray = [];
let filterSeriesDataArray = [];

// Config app to use EJS
app.set('view engine', 'ejs');

// Allow the req.body to be used
app.use(bodyParser.urlencoded({ extended: true }));

// Allow the server to run static files
app.use(express.static('public'));

// GET localhost:3000/
app.get('/', async (req, res) => {
  // Garantee that the data don't get fetch again, and show duplicates on the frontEnd
  filterMovieDataArray = [];
  filterSeriesDataArray = [];

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
        poster: result.poster_path
          ? `https://image.tmdb.org/t/p/original/${result.poster_path}`
          : 'https://www.themoviedb.org/assets/2/v4/glyphicons/basic/glyphicons-basic-38-picture-grey-c2ebdbb057f2a7614185931650f8cee23fa137b93812ccb132b9df511df1cfac.svg',
        description:
          result.overview || "We don't have an overview translated in English.",
        releaseDate: result.release_date
      })
    );

    // Transform the series data into a json and filter
    const jsonSeriesData = await seriesData.json();

    jsonSeriesData.results.slice(0, 10).map(result =>
      filterSeriesDataArray.push({
        title: result.name,
        poster: result.poster_path
          ? `https://image.tmdb.org/t/p/original/${result.poster_path}`
          : 'https://www.themoviedb.org/assets/2/v4/glyphicons/basic/glyphicons-basic-38-picture-grey-c2ebdbb057f2a7614185931650f8cee23fa137b93812ccb132b9df511df1cfac.svg',
        description:
          result.overview || "We don't have an overview translated in English.",
        releaseDate: result.first_air_date
      })
    );
  } catch (error) {
    console.log(error);
  }

  res.render('index', {
    filterSeriesDataArray,
    filterMovieDataArray,
    moviesGenresList,
    seriesGenresList,
    linkMovies: '#movies',
    linkSeries: '#series'
  });
});

// POST localhost:3000/
app.post('/', async (req, res) => {
  const userQueryFullString = req.body.userQuery;
  const userQueryWithPlusSign = userQueryFullString.replace(/ /g, '+');
  const userQueryWithPlusSignLower = userQueryWithPlusSign.toLowerCase();
  const userChoice = req.body.seriesOrMovie;
  let typeQuery = '';

  filterDataArray = [];

  try {
    // Based on user choice, the fetch url will change for tv or movie
    userChoice === 'series' ? (typeQuery = 'tv') : (typeQuery = 'movie');

    const data = await fetch(
      `https://api.themoviedb.org/3/search/${typeQuery}?api_key=${process.env.API_KEY}&query=${userQueryWithPlusSignLower}`
    );

    const jsonData = await data.json();

    // Tv and Movie have different properties name
    if (userChoice === 'series') {
      jsonData.results.slice(0, 10).map(result =>
        filterDataArray.push({
          title: result.name,
          poster: result.backdrop_path
            ? `https://image.tmdb.org/t/p/original/${result.backdrop_path}`
            : 'https://www.themoviedb.org/assets/2/v4/glyphicons/basic/glyphicons-basic-38-picture-grey-c2ebdbb057f2a7614185931650f8cee23fa137b93812ccb132b9df511df1cfac.svg',
          description:
            result.overview ||
            "We don't have an overview translated in English.",
          releaseDate: result.first_air_date
        })
      );
    } else {
      jsonData.results.slice(0, 10).map(result =>
        filterDataArray.push({
          title: result.title,
          poster: result.backdrop_path
            ? `https://image.tmdb.org/t/p/original/${result.backdrop_path}`
            : 'https://www.themoviedb.org/assets/2/v4/glyphicons/basic/glyphicons-basic-38-picture-grey-c2ebdbb057f2a7614185931650f8cee23fa137b93812ccb132b9df511df1cfac.svg',
          description:
            result.overview ||
            "We don't have an overview translated in English.",
          releaseDate: result.release_date
        })
      );
    }

    res.redirect('/results');
  } catch (error) {
    console.log(error);
  }
});

// POST localhost:3000/moviesGenres
app.post('/moviesGenres', async (req, res) => {
  const userMoviesGenreChoice = req.body.moviesGenres;

  filterGenreArray = [];

  try {
    const data = await fetch(
      `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&with_genres=${userMoviesGenreChoice}`
    );

    const jsonData = await data.json();

    jsonData.results.slice(0, 10).map(result =>
      filterGenreArray.push({
        title: result.title,
        poster: result.backdrop_path
          ? `https://image.tmdb.org/t/p/original/${result.backdrop_path}`
          : 'https://www.themoviedb.org/assets/2/v4/glyphicons/basic/glyphicons-basic-38-picture-grey-c2ebdbb057f2a7614185931650f8cee23fa137b93812ccb132b9df511df1cfac.svg',
        description:
          result.overview || "We don't have an overview translated in English.",
        releaseDate: result.release_date
      })
    );
  } catch (error) {
    console.log(error);
  }

  res.redirect('/genres/results');
});

// POST localhost:3000/seriesGenres
app.post('/seriesGenres', async (req, res) => {
  const userSeriesGenreChoice = req.body.seriesGenres;

  filterGenreArray = [];

  try {
    const data = await fetch(
      `https://api.themoviedb.org/3/discover/tv?api_key=${process.env.API_KEY}&language=en-US&sort_by=popularity.desc&page=1&with_genres=${userSeriesGenreChoice}`
    );

    const jsonData = await data.json();

    jsonData.results.slice(0, 10).map(result =>
      filterGenreArray.push({
        title: result.name,
        poster: result.backdrop_path
          ? `https://image.tmdb.org/t/p/original/${result.backdrop_path}`
          : 'https://www.themoviedb.org/assets/2/v4/glyphicons/basic/glyphicons-basic-38-picture-grey-c2ebdbb057f2a7614185931650f8cee23fa137b93812ccb132b9df511df1cfac.svg',
        description:
          result.overview || "We don't have an overview translated in English.",
        releaseDate: result.first_air_date
      })
    );
  } catch (error) {
    console.log(error);
  }

  res.redirect('/genres/results');
});

// GET localhost:3000/results
app.get('/results', (req, res) => {
  res.render('results', { filterDataArray });
});

app.get('/genres/results', (req, res) => {
  res.render('results', { filterDataArray: filterGenreArray });
});

// Makes app ready to run on production too
app.listen(process.env.PORT || 3000, () =>
  console.log('Server running on port 3000')
);

module.exports = app;
