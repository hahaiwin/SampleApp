var express = require('express');
var router = express.Router();

/* GET groupManagerIndex page. */
router.get('/', function(req, res, next) {
    res.render('groupManagerIndex', { });
});

module.exports = router;