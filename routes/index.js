/**
 * Created by hao on 7/8/17.
 * this is actually configuring UI, and I only use one page to
 * render the result.
 */
var express = require('express');
var router = express.Router();

/**
 * the only router in the UI
 */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express' });
});

module.exports = router;