

const passport = require("passport");
const users = require ("./routes/api/users");
const bodyParser = require('body-parser');
const logger = require('morgan');
const mongoose = require ('mongoose');
const { getConfig } = require ('./config');
const CommentHandler =require ('./models/handlers/CommentHandler');
const express = require('express');

// and create our instances
const app = express();
const router = express.Router();

// set our port to either a predetermined port number if you have set it up, or 3001
const API_PORT = process.env.API_PORT || 3005;
// mongoose.connect(getConfig('dbUri'), { useNewUrlParser: true})
//         .then(() => console.log( "MongoDB successfully connected"))
//         .catch( err => console.log(err));
// var db = mongoose.connection;
// db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// DB Config
const db = require("./config/keys").mongoURI;
// Connect to MongoDB
mongoose
  .connect(
    db,
    { useNewUrlParser: true }
  )
  .then(() => console.log("MongoDB successfully connected"))
  .catch(err => console.log(err));
// now we should configure the API to use bodyParser and look for JSON data in the request body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger('dev'));

// now we can set the route path & initialize the API
router.get('/', (req, res) => {
  res.json({ message: 'Hello, World!' });
});

router.get('/comments', (req, res) => CommentHandler.getAllComments(req, res));

router.post('/comments', (req, res) => CommentHandler.updateComment(req, res));

router.put('/comments/:commentId', (req, res) => CommentHandler.getCommentById(req, res));

router.delete('/comments/:commentId', (req, res) => CommentHandler.deleteComment(req, res));

// Use our router configuration when we call /api
app.use('/api', router);
//app.use(passport.initialize());
//require("./config/passport")(passport);
//app.use("/api/users", users);

app.listen(API_PORT, () => console.log(`Listening on port ${API_PORT}`));
