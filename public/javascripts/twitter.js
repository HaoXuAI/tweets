
(function () {

    var tweets = angular.module('tweets', ['ngRoute','ngResource']);

    tweets.factory("tweetResource", ['$resource', function ($resource) {
        return {
            tweet: $resource('/api/tweets', {}, {
                getTweets: {method: 'GET', isArray: true}
            }),
            summarizer: $resource('/api/summarizer', {}, {
                getRepTweet: {method: 'GET', isArray: true}
            }),
            textMining: $resource('/api/textMining', {}, {
                getText: {method: 'GET', isArray: true}
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
        $scope.search = false;
        $scope.reps = [];
        $scope.words = [];

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
            tweetResource.summarizer.getRepTweet({text: $scope.tweets}, function (data) {
                $scope.reps = data;
            }, function (error) {
                console.alert(error);
            });
        }

        function getWords() {

            tweetResource.textMining.getText({text: $scope.tweets}, function (data) {
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

        console.log($scope);
    }]);



})();