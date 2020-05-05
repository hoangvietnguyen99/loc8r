const index = (req, res) => {
    res.render('index', {title: 'loc8r'});
};

module.exports = {
    index
};