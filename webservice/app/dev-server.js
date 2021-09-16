/* eslint-disable strict */
'use strict';

const _ = require('lodash');
const path = require('path');
const express = require('express');
const webpack = require('webpack');
const config = require('./webpack-config');
const fetch = require('node-fetch');
const crypto = require('crypto');

const app = express();
const compiler = webpack(config);
const devMiddleware = require('webpack-dev-middleware')(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath,
});

app.use(devMiddleware);
app.use(require('webpack-hot-middleware')(compiler));
app.use(express.json());
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded


function getUser(req) {
  let details = {
    username: req.body.email,
    password: req.body.password
  }
  return Object.keys(details).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(details[key])).join('&');
}

app.post("/api/verify-login", (req, res, next) => {
  try {
    let user = getUser(req);
    // CouchDB has to be accessed over the DOCKER NETWORK
    let url = "http://auth/login"

    const promiseProviders = fetch(url, {
    	method: "post",
    	headers: {
      	'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    	},
    	body: user
  	 })
      .then(response => {
        console.log(response)
        if(response.status == 200) {
          return response.json()
        }
        else {
          res.json({
            status: response.status,
            message: "failure",
            error: response.statusText
          });
        }
      })
      .then(response => {
        res.json(response)
      })
      .catch(err => {
        console.log(err)
      });
  }
  catch (err) {
    next(err)
  }
});


app.post("/api/register-user", (req, res, next) => {
  try {
    let user = getUser(req);
    // CouchDB has to be accessed over the DOCKER NETWORK
    let url = "http://auth/register"

    const promiseProviders = fetch(url, {
    	method: "post",
    	headers: {
      	'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    	},
    	body: user
  	 })
      .then(response => {
        console.log(response)
        if(response.status == 201) {
          res.json({
            status: 201,
            message: "success"
          });
        }
        else {
          res.json({
            status: response.status,
            message: "failure",
            error: response.statusText
          });
        }
      })
      .catch(err => {
        console.log(err)
      });
  }
  catch (err) {
    next(err)
  }
});

app.use(function(req, res, next) {
  const reqPath = req.url;
  console.log(reqPath);
  // find the file that the browser is looking for
  const file = _.last(reqPath.split('/'));
  if (['index.html'].indexOf(file) !== -1) {
    // Load index.html
    res.end(devMiddleware.fileSystem.readFileSync(path.join(config.output.path, file)));
  } else if (file.indexOf('.') === -1) {
    // if the url does not have an extension, assume they've navigated to something like /home and want index.html
    res.end(devMiddleware.fileSystem.readFileSync(path.join(config.output.path, 'index.html')));
  } else {
    next();
  }
});

/* eslint-disable no-console */
var server = app.listen(process.env.WEBPACK_PORT, process.env.WEBPACK_IP, function(err) {
  if (err) {
    console.log(err);
    return;
  }

  console.log('Listening at ' + process.env.BASE_URL);
});



/* eslint-enable no-console */
