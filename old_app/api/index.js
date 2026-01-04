
const express = require('express');
const app = express();

app.all('/spotify/data/:key', (req, res) => {
  res.send('Success ')
})

module.exports = app
