/**
 * Created by hao on 7/9/17.
 */
var express = require('express');
var router = express.Router();

router.get('/twitter', function(req, res, next) {
    console.log(req);
});

module.exports = router;