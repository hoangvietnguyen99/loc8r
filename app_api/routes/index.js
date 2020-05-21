//Map API request to appropriate controller

const express = require('express');
const router = express.Router();
const locationsController = require('../controllers/locations');
const reviewsController = require('../controllers/reviews');

// locations
router
    .route('/locations')
    .get(locationsController.locationsListByDistance)
    .post(locationsController.locationsCreate); //for create
router
    .route('/locations/:locationid')
    .get(locationsController.locationsReadOne)
    .put(locationsController.locationsUpdateOne) //for update
    .delete(locationsController.locationsDeleteOne); //for delete

// reviews
router
    .route('/locations/:locationid/reviews')
    .post(reviewsController.reviewsCreate);
router
    .route('/locations/:locationid/reviews/:reviewid')
    .get(reviewsController.reviewsReadOne)
    .put(reviewsController.reviewsUpdateOne)
    .delete(reviewsController.reviewsDeleteOne);

module.exports = router;