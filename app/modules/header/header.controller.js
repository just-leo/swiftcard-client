'use strict'

angular.module('header')
	.controller('HeaderController',
		function HeaderController(
			$rootScope,
			$scope,
			AuthService,
			$state,
			authApi,
			STATES,
			$interval,
			cfpLoadingBar,
			AUTH_EVENTS) {

			$scope.isAuthenticated = AuthService.isAuthenticated();

			$scope.logout = function(){
				cfpLoadingBar.start();
				AuthService.logout().then(function(){
					logoutSuccess()
				}, function(reason) {
					console.warn('Server rejected logout', reason);
					logoutSuccess()
				})
			}

			var offLoginEvent = $scope.$on(AUTH_EVENTS.loginSuccess, function(e){
				$scope.isAuthenticated = true
			})

			$scope.$on('$destroy', offLoginEvent);

			function logoutSuccess() {
				$scope.isAuthenticated = false;
				if(cfpLoadingBar.status() > 0) {
					cfpLoadingBar.complete()
				}
				//$state.go(STATES.LOGINPAGE, null, {reload: true})
			}
		}
	)