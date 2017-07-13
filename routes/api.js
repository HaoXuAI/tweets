/**
 * Created by hao on 7/8/17.
 *
 * four api implementation:
 * 1. tweets, get tweets of a user
 * 2. summarizer, user lexrank to summarize
 * 3. clustering, user clustering to summarize
 * 4. getKeywords, get key words.
 *
 * two helper functions:
 * 1. dist, get distance of two sentences
 * 2. preprocessing, preprocess text
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


/**
 *  get tweets api, which counts to 200, might be optimized by asynchronous to
 *  get all tweets of a user.
 */
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

/**
 * use lexrank to summarize, up to 10 representatives.
 */
router.get('/summarizer', function (req, res, next) {

    let originalText = preprocessing(req.query.text, null, false);

    lexrank.summarize(originalText, 10, function (err, toplines, text) {
        res.end(JSON.stringify(toplines));
    }, function (error) {
        next(error);
    });

});

/**
 * use clustering to clustering tweets and get representative tweet of each
 * cluster, weighted by the shortest distance.
 */
router.get('/clustering', function (req, res) {
    var NGrams = natural.NGrams;

    var Tfidf = natural.TfIdf;
    var tfidf = new Tfidf();

    let tweets = preprocessing(req.query.text, null, true);
    let originalText = preprocessing(req.query.text, req.query.username, false);

    tfidf.addDocument(originalText);

    let tweet_vec = [];

    for (let i = 0; i < tweets.length; i++) {
        let grammer = NGrams.ngrams(tweets[i], 7, null, null);
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

    /* use k-means to do clustering */
    var result = ml.kmeans.cluster({
        data : vectors,
        k : 10,
        epochs: 100,

        distance : {type : "pearson"}
    });

    /* find shortest distance to centroid */
    let clusters = [];

    result.clusters.forEach(function (cluster) {
        let new_cluster = [];
        for (let i = 0; i < cluster.length; i++) {
            new_cluster.push(tweet_vec[cluster[i]].index);
        }
        clusters.push(new_cluster);
    });

    let ids = [];
    for (let i = 0; i < result.clusters.length; i++) {
        let cluster = result.clusters[i];
        let distances = [];
        for (let j = 0; j < cluster.length; j++) {
            distances.push(dist(vectors[cluster[j]], result.means[i]));
        }
        let minIdx = distances.indexOf(Math.min(...distances));
        ids.push(tweet_vec[cluster[minIdx]].index);
    }

    let finales = {clusters: clusters, means: result.means, center: ids};
    res.end(JSON.stringify(finales));
});

/**
 * get key words of a user, weighted by TFIDF
 */
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

/**
 * helper function to return distance of two vectors
 * @param arr1
 * @param arr2
 * @returns {number}
 */
function dist(arr1, arr2) {
    let dist = 0;
    for (let i = 0; i < arr1.length; i++) {
        dist += Math.pow((arr1[i] - arr2[i]), 2)
    }
    return Math.pow(dist, 0.5);
}

/**
 * helper function to pre-process and tokenize text
 * @param text
 * @param username
 * @param isArray
 * @returns {*}
 */
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
