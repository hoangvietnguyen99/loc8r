const mongoose = require('mongoose');
const locationModel = mongoose.model('Location');

const doSetAverageRating = (location) => {
    if (location.reviews && location.reviews.length > 0) {
        const count = location.reviews.length;
        const total = location.reviews.reduce((acc, {rating}) => { //acc: accumulator
            return acc + rating;
        }, 0);
        location.rating = parseInt(total / count, 10);
        location.save(err => {
            if (err) {
                console.log(err);
            } else {
                console.log(`Average rating updated to ${location.rating}`);
            }
        });
    }
};

const updateAverageRating = (locationId) => {
    locationModel.findById(locationId)
        .select('rating reviews')
        .exec((err, location) => {
            doSetAverageRating(location);
        });
};

const doAddReview = (req, res, location) => {
    if (!location) {
        res.status(404)
            .json({
                "message": "Location not found"
            });
    } else {
        const {author, rating, reviewText} = req.body;
        location.reviews.push({
            author,
            rating,
            reviewText
        });
        location.save((err, location) => {
            if (err) {
                res.status(400) // không lưu được xuống database
                    .json(err);
            } else {
                updateAverageRating(location._id);
                const thisReview = location.reviews[location.reviews.length - 1];
                res.status(201)
                    .json(thisReview);
            }
        })
    }
};

const reviewsCreate = (req, res) => {
    const locationId = req.params.locationid; //Lấy locationid từ req.params qua GET method
    if (locationId) {
        locationModel.findById(locationId)
            .select('reviews')
            .exec((err, location) => {
                if (err) {
                    res.status(404)
                        .json(err);
                } else {
                    doAddReview(req, res, location);
                }
            });
    } else {
        res.status(404)
            .json({
                "message": "Location ID is required"
            });
    }
};

const reviewsReadOne = (req, res) => {
    locationModel.findById(req.params.locationid)
        .select("name reviews")
        .exec((err, location) => {
            if (!location) {
                return res.status(404)
                    .json({
                        "message": "Location not found"
                    });
            } else if (err) {
                return res.status(400) //An unsuccessful GET request due to invalid content
                    .json(err);
            }

            if (location.reviews && location.reviews.length > 0) {
                const review = location.reviews.id(req.params.reviewid);

                if (!review) {
                    return res.status(404)
                        .json({
                            "message": "Review not found"
                        });
                } else {
                    const response = {
                        location: {
                            name: location.name,
                            id: req.params.locationid
                        },
                        review
                    };

                    return res.status(200)
                        .json(response);
                }
            } else {
                return res.status(404)
                    .json({
                        "message": "No reviews found"
                    });
            }
        });
};

const reviewsUpdateOne = (req, res) => {
    if (!req.params.locationid || !req.params.reviewid) {
        return res.status(404)
            .json({
                "message": "Not found, locationid and reviewid are both required"
            });
    }
    locationModel.findById(req.params.locationid)
        .select("reviews")
        .exec((err, location) => {
            if (!location) {
                return res.status(404)
                    .json({
                        "message": "Location not found"
                    });
            } else if (err) {
                return res.status(400)
                    .json(err);
            }
            if (location.reviews && location.reviews.length > 0) {
                const thisReview = location.reviews.id(req.params.reviewid);
                if (!thisReview) {
                    res.status(404)
                        .json({
                            "message": "Review not found"
                        });
                } else {
                    thisReview.author = req.body.author;
                    thisReview.rating = req.body.rating;
                    thisReview.reviewText = req.body.reviewText;
                    location.save((err, location) => {
                        if (err) {
                            return res.status(404)
                                .json(err);
                        } else {
                            updateAverageRating(location._id);
                            res.status(200)
                                .json(thisReview);
                        }
                    });
                }
            } else {
                res.status(404)
                    .json({
                        "message": "No review to update"
                    });
            }
        });
};

const reviewsDeleteOne = (req, res) => {
    const {locationid, reviewid} = req.params;
    if (!locationid || !reviewid) {
        return res.status(404)
            .json({
                "message": "Not found, locationid and reviewid are both required"
            });
    } else {
        locationModel.findById(locationid)
            .select('reviews')
            .exec((err, location) => {
                if (!location) {
                    return res.stats(404)
                        .json({
                            "message": "Location not found"
                        });
                } else if (err) {
                    return res.status(400) //Unsuccessful GET request due to invalid content
                        .json(err);
                } else {
                    if (location.reviews && location.reviews.length > 0) {
                        if (!location.reviews.id(reviewid)) {
                            return res.status(404)
                                .json({
                                    "message": "Review not found"
                                });
                        } else {
                            location.reviews.id(reviewid).remove();
                            location.save(err => {
                                if (err) {
                                    return res.status(404)
                                        .json(err)
                                } else {
                                    updateAverageRating(location._id);
                                    res.status(204) //A successful DELETE request
                                        .json(null);
                                }
                            });
                        }
                    } else {
                        res.status(404)
                            .json({
                                "message": "No review to delete"
                            });
                    }
                }
            });
    }
};

module.exports = {
    reviewsCreate,
    reviewsDeleteOne,
    reviewsReadOne,
    reviewsUpdateOne
};