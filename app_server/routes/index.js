var express = require('express');
var router = express.Router();

/* Controllers */
const locationsController = require('../controllers/locations');
const othersController = require('../controllers/others');

/* GET home page. */
router.get('/', locationsController.homeList);
router.get('/location/:locationid', locationsController.locationInfo);
router
    .route('/location/:locationid/review/new')
    .get(locationsController.addReview)
    .post(locationsController.doAddReview);

router.get('/about', othersController.about);

module.exports = router;
