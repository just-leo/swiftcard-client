angular
    .module('welcome', ['card-swipe', 'ui-notification'])
    .value('loginRedirectState', 'root.main.success')
    .controller('WelcomeController', function WelcomeController(
        $rootScope, $scope, AuthService, authApi, Notification, loginRedirectState, $state
    ) {

        var offSwipe = $rootScope.$on('cardSwipe', function(e, HardID) {
            e.preventDefault()
            //@todo rework/check transition to default page
            AuthService.login({login: HardID}).then(
                function (response) {
                    var lastState = AuthService.getReturnState();
                    if (lastState) {
                        return $state.go(lastState.name, lastState.params, {reload: false})
                    } else {
                        return $state.go(loginRedirectState, {}, {reload: false})
                    }
                },
                function (errResponse) {
                    if (errResponse.status === 422) {
                        $scope.serverErrors = _.keyBy(errResponse.data, 'field')
                        angular.forEach($scope.serverErrors, function (field) {
                            Notification.error({
                                title: 'Ошибка',
                                message: field.message
                            })
                        })
                    } else {
                        Notification.error({
                            title: 'Ошибка ' + errResponse.status,
                            message: errResponse.data ? errResponse.data.message : errResponse.statusText
                        })
                    }
                }
            )
        })

        $scope.$on('$destroy', offSwipe)
    })