
(function () {

    var tweets = angular.module('tweets', ['ngRoute','ngResource']);

    tweets.factory("tweetResource", ['$resource', function ($resource) {
        return {
            tweet: $resource('/api/tweets', {}, {
                getTweets: {method: 'GET', isArray: true}
            }),
            summarizer: $resource('/api/summarizer', {}, {
                getRepTweet: {method: 'GET', isArray: true}
            })
        };
    }]);

    var getTweets = angular.module('getTweets', ['tweets','ngMaterial', 'angular-d3-word-cloud', ]);

    getTweets.config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';

    }]);

    getTweets.controller("twitterController",  ["$scope", "tweetResource", "$mdDialog", "$window", "$element",
        function ($scope, tweetResource, $window, $element, $mdDialog) {

        $scope.tweets = [];
        $scope.username = "";
        $scope.text = "";
        $scope.search = false;
        $scope.customFullscreen = false;
        $scope.reps = [];
        $scope.status= '';
        $scope.words = [];

        $scope.$watch('username', function (value) {
            $scope.username = value;
        });

        $scope.click = function ($event) {
            getTweets(getReps, getWords);
        }

        function getTweets(callback1, callback2) {
            tweetResource.tweet.getTweets({name: $scope.username}, function (data) {
                $scope.tweets = data;
                $scope.tweets.forEach(function (tweet) {
                    $scope.text += tweet;
                });
                $scope.search = true;
                callback1();
                callback2();
            });

        };

        function getWords() {
            var freq = {};
            var texts;
            texts = $scope.text.split(/\s+/g);




            texts.forEach(function (word) {
                if (!freq[word]) {
                    freq[word] = 0;
                }
                freq[word] += 1;
            });
            for (let word in freq) {
                $scope.words.push({text:word, size:freq[word]});
            }
            $scope.words.sort(function (a, b) {
                return b.size - a.size;
            })
            $scope.words = $scope.words.slice(0, 50);

            d3.wordcloud()
                .size([800, 400])
                .selector('#cloud')
                .words($scope.words)
                .start();
        }

        function getReps() {
            tweetResource.summarizer.getRepTweet({text: $scope.text}, function (data) {
                $scope.reps = data;
            });
        };

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



        console.log($scope);
    }]);



})();