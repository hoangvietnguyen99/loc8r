var express = require('express');
var router = express.Router();

/* Controllers */
const locationsController = require('../controllers/locations');
const othersController = require('../controllers/others');

/* GET home page. */
router.get('/', locationsController.homeList);
router.get('/location', locationsController.locationInfo);
router.get('/location/review/new', locationsController.addReview);
router.get('/about', othersController.about);

module.exports = router;
