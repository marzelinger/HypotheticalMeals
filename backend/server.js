// server.js
// This file contains all of the routes for databases, organized by document.

// first we import our dependencies…
import express from 'express';
import bodyParser from 'body-parser';
import logger from 'morgan';
import mongoose from 'mongoose';
import SkuHandler from './models/handlers/SkuHandler';
import Prod_LineHandler from './models/handlers/Prod_LineHandler';
import Manu_LineHandler from './models/handlers/Manu_LineHandler';
import IngredientHandler from './models/handlers/IngredientHandler';
import Manu_GoalHandler from './models/handlers/Manu_GoalHandler';
import UserHandler from './models/handlers/UserHandler';
import FilterHandler from './models/handlers/FilterHandler';
import FormulaHandler from './models/handlers/FormulaHandler';
import Manu_ActivityHandler from './models/handlers/Manu_ActivityHandler';
import { getSecret } from './secrets';
const passport = require("passport");
import CSV_parser from './csv_parser';
import CustomerHandler from './models/handlers/CustomerHandler';
import Sale_RecordHandler from './models/handlers/Sale_RecordHandler';
import ScraperHandler from './models/handlers/Scraper';
var https = require('https');
var fs = require('fs');
var multer = require('multer');
var upload = multer(({ dest : './tmp/csv'}));

const cors = require('cors');
var path = require("path");



const dotenv = require('dotenv');
dotenv.config();
// and create our instances
const app = express();
const router = express.Router();
var corsOptions = {
  origin: '*',
  optionSuccessStatus: 200
};
 
app.use(cors(corsOptions));

// set our port to either a predetermined port number if you have set it up, or 3001
const API_PORT = process.env.API_PORT || 3001;

mongoose.connect(getSecret('dbUri'));
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

//app.use(express.static(path.join(__dirname, './../client/public')));
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
router.put('/skus/:sku_id', (req, res) => SkuHandler.updateSkuByID(req, res));
router.get('/skus', (req, res) => SkuHandler.getAllSkus(req, res));
router.get('/skus/prodline/:prod_line_id', (req, res) => SkuHandler.getSkusByProdLine(req, res));

router.get('/skus/:sku_id', (req, res) => SkuHandler.getSkuByID(req, res));
router.get('/skus_num/:sku_num', (req, res) => SkuHandler.getSkusBySkuNumer(req, res));
router.delete('/skus/:sku_id', (req, res) => SkuHandler.deleteSkuByID(req, res));
router.get('/ingredients_by_sku/:sku_id', (req, res) => SkuHandler.getIngredientsBySkuID(req, res));
router.get('/skus_name/:search_substr', (req, res) => SkuHandler.getSkusByNameSubstring(req, res));
router.get('/skus/manu_line_id/:manu_line_id', (req, res) => SkuHandler.getSkuByManuLineID(req, res));

// Formula database APIs
router.post('/formulas', (req, res) => FormulaHandler.createFormula(req, res));
router.put('/formulas/:formula_id', (req, res) => FormulaHandler.updateFormulaByID(req, res));
router.get('/formulas', (req, res) => FormulaHandler.getAllFormulas(req, res));
router.get('/formulas/:formula_id', (req, res) => FormulaHandler.getFormulaByID(req, res));
router.delete('/formulas/:formula_id', (req, res) => FormulaHandler.deleteFormulaByID(req, res));
router.get('/formulas_name/:search_substr', (req, res) => FormulaHandler.getFormulasByNameSubstring(req, res));

// Product Line database APIs
router.post('/products', (req, res) => Prod_LineHandler.createProductLine(req, res));
router.put('/products/:prod_line_id', (req, res) => Prod_LineHandler.updateProductLineByID(req, res));
router.get('/products', (req, res) => Prod_LineHandler.getAllProductLines(req, res));
router.get('/products/:currentPage/:pageSize', (req, res) => Prod_LineHandler.getAllProductLinesPag(req, res));

router.get('/products/:prod_line_id', (req, res) => Prod_LineHandler.getProductLineByID(req, res));
router.delete('/products/:prod_line_id', (req, res) => Prod_LineHandler.deleteProductLineByID(req, res));
router.get('/products_name/:search_substr/:currentPage/:pageSize', (req, res) => Prod_LineHandler.getProductLinesByNameSubstring(req, res));

// Manufacturing Line database APIs
router.post('/manulines', (req, res) => Manu_LineHandler.createManufacturingLine(req, res));
router.put('/manulines/:manu_line_id', (req, res) => Manu_LineHandler.updateManufacturingLineByID(req, res));
router.get('/manulines', (req, res) => Manu_LineHandler.getAllManufacturingLines(req, res));
router.get('/manulines/:manu_line_id', (req, res) => Manu_LineHandler.getManufacturingLineByID(req, res));
router.delete('/manulines/:manu_line_id', (req, res) => Manu_LineHandler.deleteManufacturingLineByID(req, res));
router.get('/manulines_name/:search_substr', (req, res) => Manu_LineHandler.getManufacturingLinesByNameSubstring(req, res));
router.get('/manulines_shortname/:short_name', (req, res) => Manu_LineHandler.getManufacturingLinesByShortName(req, res));

// Manufacturing Activity database APIs
router.post('/manuactivities', (req, res) => Manu_ActivityHandler.createManufacturingActivity(req, res));
router.put('/manuactivities/:manu_activity_id', (req, res) => Manu_ActivityHandler.updateManufacturingActivityByID(req, res));
router.get('/manuactivities', (req, res) => Manu_ActivityHandler.getAllManufacturingActivities(req, res));
router.get('/manuactivities/:manu_activity_id', (req, res) => Manu_ActivityHandler.getManufacturingActivityByID(req, res));
router.delete('/manuactivities/:manu_activity_id', (req, res) => Manu_ActivityHandler.deleteManufacturingActivityByID(req, res));
router.get('/manuactivities/:manu_line_id/:start_date/:end_date/:duration', (req, res) => Manu_ActivityHandler.getManufacturingActivitiesForReport(req, res));
router.get('/manuactivities/:sku_id/:start/:end', (req, res) => Manu_ActivityHandler.getManufacturingActivitiesBySKU(req, res));


// Ingredient database APIs
router.post('/ingredients', (req, res) => IngredientHandler.createIngredient(req, res));
router.put('/ingredients/:ingredient_id', (req, res) => IngredientHandler.updateIngredientByID(req, res));
router.get('/ingredients', (req, res) => IngredientHandler.getAllIngredients(req, res));
router.get('/ingredients/:ingredient_id', (req, res) => IngredientHandler.getIngredientByID(req, res));
router.delete('/ingredients/:ingredient_id', (req, res) => IngredientHandler.deleteIngredientByID(req, res));
// router.get('/skus_by_ingredient/:ingredient_id', (req, res) => IngredientHandler.getSkusByIngredientID(req, res));
router.get('/ingredients_name/:search_substr', (req, res) => IngredientHandler.getIngredientsByNameSubstring(req, res));

// Manufacturing Goals database APIs
router.post('/manugoals', (req, res) => Manu_GoalHandler.createManufacturingGoal(req, res));
router.put('/manugoals/:user_id/:manu_goal_id', (req, res) => Manu_GoalHandler.updateManufacturingGoalByID(req, res));
router.get('/manugoals/:sort_field', (req, res) => Manu_GoalHandler.getAllManufacturingGoals(req, res));
// router.get('/manugoals/:user_id/:manu_goal_id', (req, res) => Manu_GoalHandler.getManufacturingGoalByID(req, res));
router.delete('/manugoals/:manu_goal_id', (req, res) => Manu_GoalHandler.deleteManufacturingGoalByID(req, res));
// router.get('/manugoals/:user_id/:manu_goal_id/skus', (req, res) => Manu_GoalHandler.getManufacturingGoalByIDSkus(req, res));
router.get('/manugoals_filter/:name_substr/:user_substr/:user', (req, res) => Manu_GoalHandler.getManufacturingGoalByFilter(req, res));
router.get('/manugoals_activity/:activity_id', (req, res) => Manu_GoalHandler.getManufacturingGoalByActivity(req, res));
router.get('/manugoals_name/:name',(req, res) => Manu_GoalHandler.getManufacturingGoalByName(req, res));

// Customer database APIs
router.post('/customers', (req, res) => CustomerHandler.createCustomer(req, res));
router.get('/customers', (req, res) => CustomerHandler.getAllCustomers(req, res));
router.get('/customers_name/:name_substring', (req, res) => CustomerHandler.getCustomerByNameSubstring(req, res));
router.get('/customer_number/:customer_number', (req, res) => CustomerHandler.getCustomerByNumber(req, res));
router.get('/customers/:customer_id', (req, res) => CustomerHandler.getCustomerByID(req, res));


// Sale Records database APIs
router.post('/records', (req, res) => Sale_RecordHandler.createRecord(req, res));
router.get('/records', (req, res) => Sale_RecordHandler.getAllRecords(req, res));

// Multiple database APIs
router.get('/ingredients_filter/:sort_field/:sku_ids/:keyword/:currentPage/:pageSize', (req, res) => FilterHandler.getIngredientsByFilter(req, res));
router.get('/skus_filter/:sort_field/:ingredient_ids/:keyword/:currentPage/:pageSize/:prod_line_ids/:formula_id', (req, res) => FilterHandler.getSkusByFilter(req, res));
router.get('/users_filter/:sort_field/:user_ids/:keyword/:currentPage/:pageSize', (req, res) => FilterHandler.getUsersByFilter(req, res));
router.get('/formulas_filter/:sort_field/:ingredient_ids/:keyword/:currentPage/:pageSize', (req, res) => FilterHandler.getFormulasbyFilter(req, res));
router.get('/records_filter/:sort_field/:customer_id/:prod_line_ids/:sku_id/:date_range_start/:date_range_end/:currentPage/:pageSize', (req, res) => FilterHandler.getSaleRecordsbyFilter(req, res));


// CSV Parser database APIs
router.post('/parseSkus', upload.single('file'), (req, res) => CSV_parser.parseSKUCSV(req, res));
router.post('/parseProdLines', upload.single('file'), (req, res) => CSV_parser.parseProdLineCSV(req,res));
router.post('/parseIngredients', upload.single('file'), (req,res) => CSV_parser.parseIngredientsCSV(req, res));
router.post('/parseFormulas', upload.single('file'), (req, res) => CSV_parser.parseFormulasCSV(req, res));
router.post('/parseUpdateSkus', (req, res) => CSV_parser.parseUpdateSKU(req, res));
router.post('/parseUpdateIngredients', (req, res) => CSV_parser.parseUpdateIngredients(req, res));

router.put('/users/:user_id', (req, res) => UserHandler.updateUserByID(req, res));

//scraping

router.get('/scrape_customers', (req, res) => ScraperHandler.scrapeAllCustomers(req, res));
router.put('/scrape_new_sku', (req, res) => ScraperHandler.updateNewSku(req, res));
router.put('/scrape_new_sku_bulk', (req, res) => ScraperHandler.bulkUpdateSkus(req, res));
router.get('/trigger_reset', (req, res) => ScraperHandler.triggerReset(req, res));
router.get('/update_all', (req, res) => ScraperHandler.updateAllRecords(req, res));
router.get('/status/:sku_num', (req, res) => ScraperHandler.getStatus(req, res));
// Use our router configuration when we call /api
app.use('/api', router);
app.use(passport.initialize());
require("./config/passport")(passport);
//app.use("/api/users", users);

// @route POST api/users/register
// @desc Register user
// @access Public
router.post("/users/register", (req, res) => UserHandler.createUser(req, res));


// @route POST api/users/login
// @desc Login user and return JWT token
// @access Public
router.post("/users/login", (req, res) => UserHandler.loginUserByNameAndPassword(req,res));
router.post("/users/loginDukeNetID", (req, res) => UserHandler.loginUserDukeNetID(req,res));
router.delete('/users/:user_id', (req, res) => UserHandler.deleteUserByID(req, res));
router.get('/users/:user_id', (req, res) => UserHandler.getUserByID(req, res));





// @route GET api/users/getall
// @desc Get all users in the mlab db and return them.
// @access Public
router.get('/users', (req, res) => UserHandler.getAllUsers(req, res));




// // Gives constant name to long directory home page.
//  const appPage = path.join(__dirname, '../client/build/index.html');

// // // Allows the use of files.
//  app.use(express.static('../client/build'));

// // // SERVES STATIC HOMEPAGE at '/' URL
//  app.get('*', function(req, res) {
//    res.sendFile(appPage)
//  })


/*
router.get('*', (req,res) => {
  res.sendFile(path.join(__dirname, './../client/public/index.html'))
});*/

/*
https.createServer({
  key: fs.readFileSync('./../server.key'),
  cert: fs.readFileSync('./../server.cert')
}, app)
.listen(API_PORT, () => console.log(`Listening on port ${API_PORT}`));
*/
 app.listen(API_PORT, () => console.log(`Listening on port ${API_PORT}`));
