require('dotenv').config({ path: __dirname + '/.env' }); 
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./routes');

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.use('/', routes);

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
