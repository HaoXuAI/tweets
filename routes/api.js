/**
 * Created by hao on 7/8/17.
 */
var express = require('express');
var router = express.Router();
var Twitter = require('twitter');
var lexrank = require('lexrank');
var natural = require('natural');
var ml = require('machine_learning');


var client = new Twitter({
    consumer_key: 'W3gBMoRTPItuWoxpl2cYph5nA',
    consumer_secret: 'ukAkOatHyfJ9gbK1eHbyaEQcAux4M8BOkq0VlCV9lKjwXc6qt7',
    access_token_key: '4108022729-pUgwXuHn4apgy6HOVUqqGjwiE3OOWCpEV9sNb9E',
    access_token_secret: 'EYdfi5ouuN9R80gR4AuCSIDxcJbJkFuJoVfupm5kGLQpg'
});

/* GET tweets. */

router.get('/tweets', function(req, res, next) {

    let params = {screen_name: req.query.name, count: 200};
    let texts = [];
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

    let originalText = preprocessing(req.query.text, null, false);

    lexrank.summarize(originalText, 6, function (err, toplines, text) {
        res.end(JSON.stringify(toplines));
    }, function (error) {
        next(error);
    });

});

router.get('/getKeywords', function (req, res) {

    let originalText = preprocessing(req.query.text, req.query.name, false);
    let words = [];
    var Tfidf = natural.TfIdf;
    var tfidf = new Tfidf();

    tfidf.addDocument(originalText);
    tfidf.listTerms(0).forEach(function(item) {
        words.push({text: item.term, size: item.tfidf});
    });

    res.end(JSON.stringify(words));
});

router.get('/clustering', function (req, res) {
    var NGrams = natural.NGrams;

    var Tfidf = natural.TfIdf;
    var tfidf = new Tfidf();

    let tweets = preprocessing(req.query.text, null, true);
    let originalText = preprocessing(req.query.text, req.query.username, false);

    tfidf.addDocument(originalText);

    let tweet_vec = [];

    for (let i = 0; i < tweets.length; i++) {
        let grammer = NGrams.ngrams(tweets[i], 10, null, null);
        if (grammer !== null && grammer.length !== 0) {
            let features = grammer[0];
            let vec = [];
            for (let j = 0; j < features.length; j++) {
                vec.push(tfidf.tfidf(features[j], 0));
            }
            tweet_vec.push({index: i + 1, vec: vec});
        }
    }

    let vectors = [];
    tweet_vec.forEach(function (vector) {
        vectors.push(vector.vec);
    });

    var result = ml.kmeans.cluster({
        data : vectors,
        k : 10,
        epochs: 100,

        distance : {type : "pearson"}
    });

    let clusters = [];
    result.clusters.forEach(function (cluster) {
        let new_cluster = [];
        for (let i = 0; i < cluster.length; i++) {
            new_cluster.push(tweet_vec[cluster[i]].index);
        }
        clusters.push(new_cluster);
    });

    let finales = {clusters: clusters, means: result.means};
    res.end(JSON.stringify(finales));
});

function preprocessing(text, username, isArray) {
    let originalText = "";
    let tweets = [];
    text.forEach(function (tweet) {
        let slice = tweet.replace(/[\n/\\\n/!/?/]+/g, " ").replace(/[^A-Za-z]/g, " ");
        slice = slice.replace("RT", "").replace("amp", "");
        if (username !== null) {
            slice = slice.replace(username, "");
        }

        let httpIdx = slice.indexOf("http");
        slice = slice.substring(0, httpIdx === - 1 ? tweet.length : httpIdx).trim();
        if (slice[-1] !== '.') {
            slice += '. ';
        }
        tweets.push(slice);
        originalText = originalText + slice;
    });
    if (!isArray) {
        return originalText;
    } else {
        return tweets;
    }

}

module.exports = router;
