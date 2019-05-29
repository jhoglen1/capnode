'use strict';

const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const passport = require("passport");
const { router: userRouter } = require("./user");
const { router: authorizeRouter, localStrategy, jwtStrategy } = require("./authorize");
mongoose.Promise = global.Promise;


const { DATABASE_URL, PORT } = require('./config');
const { BrewPost } = require('./models');

const app = express();

app.use(morgan('common'));
app.use(express.json());



app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
  if (req.method === "OPTIONS") {
    return res.send(204);
  }
  next();
});

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use("/api/user/", userRouter);
app.use("/api/authorize/", authorizeRouter);



const jwtAuth = passport.authenticate("jwt", { session: false });


app.get("/api/protected/", jwtAuth, (req, res) => {
  return res.json({
    data: "rosebud"
  });
});



app.get('/brewery', (req, res) => {
  BrewPost
    .find()
    .then(posts => {
      res.json(posts.map(post => post.serialize()));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went terribly wrong' });
    });
});


app.get('/brewery/:id', (req, res) => {
  BrewPost
    .findById(req.params.id)
    .then(post => res.json(post.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went horribly awry' });
    });
});


app.post('/brewery', (req, res) => {
  const requiredFields = ['User','Date', 'Brew','Brewery','Style','Review' ];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  

  BrewPost
    .create({
     User: req.body.User,
     Date: req.body.Date,
     Brew : req.body.Brew,
     Brewery: req.body.Brewery,
     Style: req.body.Style,
     Review:req.body.Review
     
    })
    
    .then(brewPost => res.status(201).json(brewPost.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error:'Something went wrong' });
    });

});



app.delete('/brewery/:id', (req, res) => {
  BrewPost
    .findByIdAndRemove(req.params.id)
    .then(() => {
      res.status(204).json({ message: 'success' });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went terribly wrong' });
    });
});



app.put('/brewery/:id', (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    });
  }

  const updated = {};
  const updateableFields = ['User','Date', 'Brew','Brewery','Style','Review'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  BrewPost
    .findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
    .then(updatedPost => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Something went wrong' }));
});


app.delete('/:id', (req, res) => {
  BrewPost
    .findByIdAndRemove(req.params.id)
    .then(() => {
      console.log(`Deleted brew post with id \`${req.params.id}\``);
      res.status(204).end();
    });
});












app.use("*", (req, res) => {
  return res.status(404).json({ message: "Not Found" });
});

// closeServer needs access to a server object, but that only
// gets created when `runServer` runs, so we declare `server` here
// and then assign a value to it in run
let server;

// this function connects to our database, then starts the server
function runServer(databaseUrl, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { runServer, app, closeServer };