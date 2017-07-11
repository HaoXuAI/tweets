/**
 * Created by hao on 7/8/17.
 */
var express = require('express');
var router = express.Router();
var Twitter = require('twitter');
var lexrank = require('lexrank');

var client = new Twitter({
    consumer_key: 'W3gBMoRTPItuWoxpl2cYph5nA',
    consumer_secret: 'ukAkOatHyfJ9gbK1eHbyaEQcAux4M8BOkq0VlCV9lKjwXc6qt7',
    access_token_key: '4108022729-pUgwXuHn4apgy6HOVUqqGjwiE3OOWCpEV9sNb9E',
    access_token_secret: 'EYdfi5ouuN9R80gR4AuCSIDxcJbJkFuJoVfupm5kGLQpg'
});

/* GET tweets. */

router.get('/tweets', function(req, res, next) {

    var params = {screen_name: req.query.name, count: 200};
    var texts = [];
    client.get('statuses/user_timeline', params, function(error, tweets) {

        if (!error) {
            //console.log(tweets);
            tweets.forEach(function (data) {
                texts.push(data.text);
            });
        } else {
            console.log(error);
        }
        res.end(JSON.stringify(texts));
    }, function (error) {
        next(error);
    });
});

router.get('/summarizer', function (req, res, next) {
    var originalText = req.query.text;
    var topLines = lexrank.summarize(originalText, 5, function (err, toplines, text) {
        if (err) {
            console.log(err);
        }
        res.end(JSON.stringify(toplines));
    });
})

module.exports = router;
