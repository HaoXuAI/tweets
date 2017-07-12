/**
 * Created by hao on 7/8/17.
 */
var express = require('express');
var router = express.Router();
var Twitter = require('twitter');
var lexrank = require('lexrank');
var tm = require('text-miner');

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

        tweets.forEach(function (data) {
            texts.push(data.text);
        });

        res.end(JSON.stringify(texts));
    }, function (error) {
        next(error);
    });
});

router.get('/summarizer', function (req, res, next) {
    var tweets = req.query.text;
    var originalText = "";
    tweets.forEach(function (tweet) {
        var http = tweet.indexOf("http");
        var slice = tweet.slice(0, http);
        originalText = originalText + "" + slice;
    })
    lexrank.summarize(originalText, 5, function (err, toplines, text) {
        res.end(JSON.stringify(toplines));
    }, function (error) {
        next(error);
    });
});

router.get('/textMining', function (req, res) {
    var originalText = req.query.text;
    var words = [];
    var trimWords = ["https://", "...", "&amp", "&", "rt", "\"", "'", "\\"];

    var my_corpus = new tm.Corpus(originalText);
    my_corpus
        .trim()
        .toLower()
        .removeNewlines()
        .removeWords(trimWords)
        .removeWords(tm.STOPWORDS.EN)
        .removeDigits()
        .removeInterpunctuation()
        .removeInvalidCharacters()
        .clean()


    var terms = new tm.Terms(my_corpus);
    var texts = terms.findFreqTerms(3);

    texts.forEach(function (word) {
        if (!trimWords.includes(word.word)) {
            words.push(({text: word.word, size: word.count}));
        }

    });

    words.sort(function (a, b) {
        return b.size - a.size;
    });
    //words = words.slice(0, 100);

    res.end(JSON.stringify(words));

});

module.exports = router;
