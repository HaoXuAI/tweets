
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

    getTweets.controller("twitterController",
                        ["$scope", "tweetResource", "$mdDialog", function ($scope, tweetResource, $mdDialog) {
        $scope.tweets = [];
        $scope.username = "";
        $scope.text = "";
        $scope.search = false;
        $scope.customFullscreen = false;
        $scope.reps = [];
        $scope.status= '';

        $scope.$watch('username', function (value) {
            $scope.username = value;
        });

        $scope.getTweets = function ($event) {

            tweetResource.tweet.getTweets({name: $scope.username}, function (data) {
                $scope.tweets = data;
                $scope.tweets.forEach(function (tweet) {
                    $scope.text += tweet;
                });
                $scope.search = true;
            });
        };

        $scope.getReps = function ($event) {
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

    getTweets.controller("d3Controller", ["$scope", "$window", "$element",
                        function ($scope, $window, $element) {
        var self = this;
        self.height = $window.innerHeight * 0.5;
        self.width = $element.find('#wordsCloud')[0].offsetWidth;
        self.wordClicked = wordClicked;
        self.rotate = rotate;
        self.words = [
            {text: 'Angular',size: 25, color: '#6d989e'},
            {text: 'Angular2',size: 35, color: '#473fa3'}
        ];

        function rotate() {
            return ~~(Math.random() * 2) * 90;
        }

        function wordClicked(word){
            alert('text: ' + word.text + ',size: ' + word.size);
        };


    }]);


})();