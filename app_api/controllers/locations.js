const mongoose = require('mongoose');
const locationModel = mongoose.model('Location');

const locationsCreate = (req, res) => {
    locationModel.create({
        name: req.body.name,
        address: req.body.address,
        facilities: req.body.facilities.split(","),
        coords: {
            type: "Point",
            coordinates: [
                parseFloat(req.body.longitude),
                parseFloat(req.body.latitude)
            ]
        },
        openingTimes: [
            {
                days: req.body.days1,
                opening: req.body.opening1,
                closing: req.body.closing1,
                closed: req.body.closed1
            },
            {
                days: req.body.days2,
                opening: req.body.opening2,
                closing: req.body.closing2,
                closed: req.body.closed2
            }
        ]
    }, (err, location) => {
        if (err) {
            res.status(400) //An unsuccessful POST request due to invalid content
                .json(err);
        } else {
            res.status(201) //A successful POST request
                .json(location);
        }
    });

};

const locationsListByDistance = (req, res) => {
    const longitude = parseFloat(req.query.longitude); //GET: use req.query | POST: use req.body
    const latitude = parseFloat(req.query.latitude);
    const near = {
        type: "Point",
        coordinates: [longitude, latitude]
    };
    const geoOptions = {
        distanceField: "distance.calculated",
        key: 'coords',
        spherical: true,
        maxDistance: 20000,
        limit: 10
    };
    if (!longitude || !latitude) {
        return res.status(404)
            .json({
                "message": "Longitude and latitude query parameters are required"
            });
    }

    try {
        const result = await locationModel.aggregate([
            {
                $geoNear: {
                    near,
                    ...geoOptions
                }
            }
        ]);
        const locations = result.map(result => {
            return {
                _id: result._id,
                name: result.name,
                address: result.address,
                rating: result.rating,
                facilities: result.facilities,
                distance: `${result.distance.calculated.toFixed()}m`
            }
        });
        res.status(200)
            .json(locations);
    } catch (err) {
        res.status(404)
            .json(err);
    }
};

const locationsReadOne = (req, res) => {
    locationModel.findById(req.params.locationid)
        .exec((err, location) => {
            if (!location) {
                return res.status(404)
                    .json({
                        "message": "Location not found"
                    });
            } else if (err) {
                return res.status(404)
                    .json(err);
            } else {
                return res.status(200) //Successful GET request
                    .json(location);
            }
        });
};

const locationsUpdateOne = (req, res) => {
    if (!req.params.locationid) {
        return res.status(404)
            .json({
                "message": "Not found, locationid is required"
            });
    }
    locationModel.findById(req.params.locationid)
        .select("-reviews -rating") //select all except reviews and rating
        .exec((err, location) => {
            if (!location) {
                return res.status(404)
                    .json({
                        "message": "Locationid not found"
                    });
            } else if (err) {
                return res.status(400) //An unsuccessful PUT request due to invalid content
                    .json(err);
            }
            location.name = req.body.name;
            location.address = req.body.address;
            location.facilities = req.body.facilities.split(','); //split return an array of substring
            location.coords = [
                parseFloat(req.body.longitude),
                parseFloat(req.body.latitude)
            ];
            location.openingTimes = [
                {
                    days: req.body.days1,
                    opening: req.body.opening1,
                    closing: req.body.closing1,
                    closed: req.body.closed1
                },
                {
                    days: req.body.days2,
                    opening: req.body.opening2,
                    closing: req.body.closing2,
                    closed: req.body.closed2
                }
            ];
            location.save((err, loc) => {
                if (err) {
                    res.status(404)
                        .json(err);
                } else {
                    res.status(200)
                        .json(loc);
                }
            });
        });
};  

const locationsDeleteOne = (req, res) => {
    const {locationid} = req.params;
    if (locationid) {
        locationModel.findByIdAndRemove(locationid)
            .exec((err, location) => {
                if (err) {
                    return res.status(404)
                        .json(err);
                }
                res.status(204)
                    .json(null);
            });
    } else {
        res.status(404)
            .json({
                "message": "No location"
            });
    }
};

module.exports = {
    locationsCreate,
    locationsDeleteOne,
    locationsListByDistance,
    locationsReadOne,
    locationsUpdateOne
};