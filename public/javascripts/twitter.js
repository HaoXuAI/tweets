
(function () {

    var tweets = angular.module('tweets', ['ngRoute','ngResource']);

    tweets.factory("tweetResource", ['$resource', function ($resource) {
        return {
            tweet: $resource('/api/tweets', {}, {
                getTweets: {method: 'GET', isArray: true}
            }),
            summarizer: $resource('/api/summarizer', {}, {
                lexrank: {method: 'GET', isArray: true}

            }),
            getKeyWords: $resource('/api/getKeywords', {}, {
                tfidf: {method: 'GET', isArray: true}
            }),
            cluster: $resource('/api/clustering', {}, {
                clustering: {method: 'GET', isArray: false}
            })
        };
    }]);

    var getTweets = angular.module('getTweets', ['tweets','ngMaterial', 'chart.js']);

    getTweets.config(['$httpProvider', 'ChartJsProvider', function($httpProvider, ChartJsProvider) {
        $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
        // Configure all charts
        ChartJsProvider.setOptions({
            chartColors: ['#FF5252'],
            responsive: false
        });
        // Configure all line charts
        ChartJsProvider.setOptions('line', {
            showLines: false
        });
    }]);

    getTweets.controller("twitterController",  ["$scope", "tweetResource", "$mdDialog", "$window",
        "$element", "$timeout", function ($scope, tweetResource, $window, $element, $mdDialog, $timeout) {

        $scope.tweets = [];
        $scope.username = "";
        $scope.text = "";
        $scope.search = false;
        $scope.reps = [];
        $scope.clusters;
        $scope.words = [];
        $scope.labels = [];
        $scope.data = [];
        $scope.series = ['weight'];

        $scope.$watch('username', function (value) {
            $scope.username = value;
        });

        $scope.click = function ($event) {
            getTweets(getReps, getWords);
        };

        function getTweets(callback1, callback2) {
            tweetResource.tweet.getTweets({name: $scope.username}, function (data) {
                $scope.tweets = data;
                $scope.search = true;
                callback1();
                callback2();
            }, function (error) {
                console.alert(error);
            });

        }

        function getReps() {
            tweetResource.summarizer.lexrank({text: $scope.tweets}, function (data) {
                $scope.reps = data;
                data.forEach(function (rep) {
                    $scope.data.push(rep.weight);
                    $scope.labels.push(rep.index);
                })
            }, tweetResource.cluster.clustering({text: $scope.tweets}, function(data) {
                $scope.clusters = data;

            }), function (error) {
                console.alert(error);
            });
        }

        function getWords() {

            tweetResource.getKeyWords.tfidf({name: $scope.username, text: $scope.tweets}, function (data) {
                $scope.words = data;

                d3.wordcloud()
                    .size([900, 500])
                    .selector('#cloud')
                    .words($scope.words)
                    .start();

            }, function (error) {
                console.alert(error);
            });
        }

        $scope.showConfirm = function(event) {

            if ($scope.tweets !== null && $scope.tweets.length !== 0) {

                var confirm = $mdDialog.confirm()
                    .title('These are all your tweets!')
                    .textContent($scope.tweets)
                    .targetEvent(event)
                    .ok('Analyze')
                    .cancel('Cancel');
                $mdDialog.show(confirm).then(function() {
                    $scope.status = 'Analyze';;
                }, function() {
                    $scope.status = 'Cancel';
                });
            }

        };

        $scope.onClick = function (points, evt) {
            console.log(points, evt);
        };

        // Simulate async data update
        $timeout(function () {

        }, 3000);

        console.log($scope);
    }]);



})();