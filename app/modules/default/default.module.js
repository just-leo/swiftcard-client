angular
    .module('default', ['card-swipe', 'ui-notification', 'angularMoment'])
    .value('loginRedirectState', 'root.main.success')
    .controller('DefaultController', function DefaultController($scope, Notification, $state, STATES, $modal, statisticsApi, cardsApi) {
        $scope.data = statisticsApi.default().$object

        $scope.query = '';
        $scope.cardList = [];
        $scope.search = function() {
            cardsApi.search({q: $scope.query}).then(
                function(resource){
                    $scope.cardList = resource
                },
                function(err){
                    $scope.cardList = []
                }
            )
        }
    })