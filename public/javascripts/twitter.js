
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

    var getTweets = angular.module('getTweets', ['tweets','ngMaterial', 'angular-d3-word-cloud']);

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
            getTweets(getReps);
        }

        function getTweets(callback) {
            tweetResource.tweet.getTweets({name: $scope.username}, function (data) {
                $scope.tweets = data;
                $scope.tweets.forEach(function (tweet) {
                    $scope.text += tweet;
                });
                $scope.search = true;
                callback();
            });

        };

        function getReps() {
            tweetResource.summarizer.getRepTweet({text: $scope.text}, function (data) {
                $scope.reps = data;
                $scope.reps.forEach(function (list) {
                    $scope.words += list.text;
                })

                $scope.words = $scope.words.split(/\s+/g);

                $scope.words = $scope.words.map(function(word) {
                    return {
                        text: word,
                        count: Math.floor(Math.random() * 4)
                    }
                }).sort(function(a, b) {
                    return b.count - a.count;
                })

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

        var vv = document.getElementById("wordsCloud");
        $scope.height = vv.offsetHeight;
        $scope.width = vv.offsetWidth;
        $scope.wordClicked = wordClicked;
        $scope.rotate = rotate;

        function rotate() {
            return ~~(Math.random() * 2) * 90;
        }

        function wordClicked(word){
            alert('text: ' + word.text + ',size: ' + word.size);
        };




        console.log($scope);
    }]);



})();