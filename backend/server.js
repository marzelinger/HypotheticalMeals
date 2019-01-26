// server.js
// This file contains all of the routes for databases, organized by document.

// first we import our dependencies…
import express from 'express';
import bodyParser from 'body-parser';
import logger from 'morgan';
import mongoose from 'mongoose';
import { getConfig } from './config';
import SkuHandler from './models/handlers/SkuHandler';
import Prod_LineHandler from './models/handlers/Prod_LineHandler';
import IngredientHandler from './models/handlers/IngredientHandler';
import Manu_GoalHandler from './models/handlers/Manu_GoalHandler';


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
router.post('/skus', (req, res) => SkuHandler.createSku(req, res));
router.put('/skus/:sku_num', (req, res) => SkuHandler.updateSkuBySkuNum(req, res));
router.get('/skus', (req, res) => SkuHandler.getAllSkus(req, res));
router.get('/skus/:sku_num', (req, res) => SkuHandler.getSkuBySkuNum(req, res));
router.delete('/skus/:sku_num', (req, res) => SkuHandler.deleteSkuBySkuNum(req, res));

// Product Line database APIs
router.post('/products', (req, res) => Prod_LineHandler.createProductLine(req, res));
router.put('/products/:prod_line_name', (req, res) => Prod_LineHandler.updateProductLineByName(req, res));
router.get('/products', (req, res) => Prod_LineHandler.getAllProductLines(req, res));
router.get('/products/:prod_line_name', (req, res) => Prod_LineHandler.getProductLineByName(req, res));
router.delete('/products/:prod_line_name', (req, res) => Prod_LineHandler.deleteProductLineByName(req, res));

// Ingredient database APIs
router.post('/ingredients', (req, res) => IngredientHandler.createIngredient(req, res));
router.put('/ingredients/:ingredient_ID', (req, res) => IngredientHandler.updateIngredientByID(req, res));
router.get('/ingredients', (req, res) => IngredientHandler.getAllIngredients(req, res));
router.get('/ingredients/:ingredient_ID', (req, res) => IngredientHandler.getIngredientByID(req, res));
router.delete('/ingredients/:ingredient_ID', (req, res) => IngredientHandler.deleteIngredientByID(req, res));

// Manufacturing Goals database APIs
router.post('/manugoals', (req, res) => Manu_GoalHandler.createManufacturingGoal(req, res));
router.put('/manugoals/:manu_goal_name', (req, res) => Manu_GoalHandler.updateManufacturingGoalByName(req, res));
router.get('/manugoals', (req, res) => Manu_GoalHandler.getAllManufacturingGoals(req, res));
router.get('/manugoals/:manu_goal_name', (req, res) => Manu_GoalHandler.getManufacturingGoalByName(req, res));
router.delete('/manugoals/:manu_goal_name', (req, res) => Manu_GoalHandler.deleteManufacturingGoalByName(req, res));

// Use our router configuration when we call /api
app.use('/api', router);

app.listen(API_PORT, () => console.log(`Listening on port ${API_PORT}`));