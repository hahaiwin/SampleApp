var express = require('express');
var fs = require('fs');
var router = express.Router();

/* GET groupManagerIndex page. */
router.get('/', function(req, res, next) {
    var param = req.query.node + '.json';
    fs.readFile('data/' + param,'utf-8', function(err, data){
        if(err){
            console.error(err);
            return;
        }
        res.send(data);
    });
});

module.exports = router;