const request = require('request'); //request module for calling API

const APIOptions = {
    server: 'http://localhost:3000' //Default server for local development
};

if (process.env.NODE_ENV === 'production') {
    APIOptions.server = 'http://nhvietloc8r.herokuapp.com'; //Live server
}

const renderHomepage = (req, res, responseBody) => {
    // let message = responseBody.message || null;
    // if (message) {
    //     responseBody = [];
    // } else if (!(responseBody instanceof Array)) { //kiểm tra xem responseBody có phải là array
    //     message = 'API lookup error';
    //     responseBody = []; //tránh view bị lỗi về kiểu dữ liệu
    // } else {
    //     if (!responseBody.length) {
    //         message = 'No places found nearby';
    //     }
    // }
    let message = null;
    if (!(responseBody instanceof Array)) { //kiểm tra xem responseBody có phải là array
        message = 'API lookup error';
        responseBody = []; //tránh view bị lỗi về kiểu dữ liệu
    } else {
        if (!responseBody.length) {
            message = 'No places found nearby';
        }
    }
    res.render('locations-list',
        {
            title: 'Loc8r - find a place to work with wifi',
            pageHeader: {
                title: 'Loc8r',
                strapLine: 'Find places to work with wifi near you!'
            },
            sidebar: "Looking for wifi and a seat? Loc8r helps you find places to work when out and about. Perhaps with coffee, cake or a pint? Let Loc8r help you find the place you're looking for.",
            locations: responseBody,
            message
        }
    );
}

const formatDistance = distance => {
    let thisDistance = 0;
    let unit = 'm';
    if (!isNaN(distance)) {
        if (distance > 1000) {
            thisDistance = parseFloat(distance/1000).toFixed(1);
            unit = 'km';
        } else {
            thisDistance = Math.floor(distance);
        }
    }
    return thisDistance + unit;
}

const homeList = (req, res) => {
    const path = '/api/locations'; //path for API request
    const requestOptions = {
        url: `${APIOptions.server}${path}`,
        method: 'GET',
        json: {}, //Json req.body
        qs: {
            longitude: -0.7992599,
            latitude: 51.378091,
            maxDistance: 20000 //m
            // longitude: 1,
            // latitude: 1,
            // maxDistance: 20000 //m
        }
    };
    request(requestOptions, (err, {statusCode}, body) => {
        // let data = body;
        let data = [];
        if (statusCode === 200 && body.length) { //chỉ chạy tiếp khi status code là 200 và có body trả về
            // data = [];
            data = body.map(item => {
                item.distance = formatDistance(item.distance); //format the calculated distance
                return item;
            });
        }
        renderHomepage(req, res, data);
    });
};

const renderDetailPage = (req, res, location) => {
    res.render('location-info', {
        title: location.name,
        pageHeader: {
            title: location.name
        },
        sidebar: {
            context: 'is on Loc8r because it has accessible wifi and space to sit down with your laptop and get some work done',
            callToAction: 'If you\'ve been and you like it - or if you don\'t - please leave a review to help other people just like you.'
        },
        location
    });
}

const showError = (req, res, status) => {
    let title = '';
    let content = '';
    if (status === 404) {
        title = '404, page not found';
        content = 'Oh dear. Looks like you can\'t find this page. Sorry';
    } else {
        title = `${status}, something's gone wrong`;
        content = 'Something, somewhere, has gone just a little bit wrong.';
    }
    res.status(status);
    res.render('generic-text', {
        title,
        content
    });
};

const getLocationInfo = (req, res, callback) => {
    const path = `/api/locations/${req.params.locationid}`;
    const requestOptions = {
        url: `${APIOptions.server}${path}`,
        method: "GET",
        json: {}
    };
    request(requestOptions, (err, {statusCode}, body) => {
        let data = body;
        if (statusCode === 200) {
            // data.coords = {
            //     longitude: body.coords[0],
            //     latitude: body.coords[1]
            // };
            callback(req, res, data);
        } else {
            showError(req, res, statusCode);
        }
    })
}

const locationInfo = (req, res) => {
    getLocationInfo(req, res, (req, res, responseData) => {
        renderDetailPage(req, res, responseData);
    })
};

const renderReviewForm = (req, res) => {
    res.render('location-review-form', {
        title: 'Review Starcups on Loc8r',
        pageHeader: {
            title: 'Review Starcups'
        }
    });
};

const addReview = (req, res) => {
    getLocationInfo(req, res, (req, res, responseData) => {
        renderReviewForm((req, res, responseData));
    });
};

const doAddReview = (req, res) => {
    const locationId = req.params.locationid;
    const path = `/api/location/${locationid}/reviews`;
    const postData = {
        author: req.body.name,
        rating: parseInt(req.body.rating, 10),
        reviewText: req.body.review
    };
    const requestOptions = {
        url: `${APIOptions.server}${path}`,
        method: 'POST',
        json: postData
    };
    if (!postData.author || !postData.rating || !postData.reviewText) {
        res.redirect(`/location/${locationid}/review/new?err=val`);
    } else {
        request(requestOptions, (err, {statusCode}, body) => {

        })
    }
}

module.exports = {
    homeList,
    locationInfo,
    addReview,
    doAddReview
};