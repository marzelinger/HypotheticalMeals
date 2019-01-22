// server.js

// first we import our dependencies…
import express from 'express';
import bodyParser from 'body-parser';
import logger from 'morgan';
import mongoose from 'mongoose';
import { getConfig } from './config';
import SkuHandler from './models/handlers/SkuHandler';
import Prod_LineHandler from './models/handlers/Prod_LineHandler';


// and create our instances
const app = express();
const router = express.Router();

// set our port to either a predetermined port number if you have set it up, or 3001
const API_PORT = process.env.API_PORT || 3001;
mongoose.connect(getConfig('dbUri'));
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// now we should configure the API to use bodyParser and look for JSON data in the request body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger('dev'));

// now we can set the route path & initialize the API
router.get('/', (req, res) => {
  res.json({ message: 'Hello, World!' });
});

// SKU database APIs
router.put('/skus/:sku_ID_param', (req, res) => SkuHandler.updateSkuByID(req, res));

router.get('/skus', (req, res) => SkuHandler.getAllSkus(req, res));

// Product Line database APIs
router.put('/products', (req, res) => Prod_LineHandler.createProductLine(req, res));

router.get('/products', (req, res) => Prod_LineHandler.getAllProductLines(req, res));

// Use our router configuration when we call /api
app.use('/api', router);

app.listen(API_PORT, () => console.log(`Listening on port ${API_PORT}`));