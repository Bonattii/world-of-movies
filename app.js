const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

// Allow to use environment variables
dotenv.config();

const app = express();

// Config app to use EJS
app.set('view engine', 'ejs');

// Allow the req.body to be used
app.use(bodyParser.urlencoded({ extended: true }));

// Allow the server to run static files
app.use(express.static('public'));

app.get('/', async (req, res) => {
  

  try {
    const data = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${process.env.API_KEY}&query=avengers+infinity`
    );
    const jsonData = await data.json();

    console.log(jsonData);
  } catch (error) {
    console.log(error);
  }

  res.render('index');
});

// Makes app ready to run on production too
app.listen(process.env.PORT || 3000, () =>
  console.log('Server running on port 3000')
);

module.exports = app;
