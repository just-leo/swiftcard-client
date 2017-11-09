'use strict';

angular.module('app.core.auth', ['LocalStorageModule'])
	.constant('AUTH_EVENTS', {
		loginSuccess: 'auth.login.success',
		loginFailed: 'auth.login.failed',
		logoutSuccess: 'auth.logout.success',
		sessionTimeout: 'auth.session.timeout',
		notAuthenticated: 'auth.not.authenticated',
		notAuthorized: 'auth.not.authorized'
	})
	.constant('USER_ROLES', {
		all: '*',
		guest: '?',
		authenticated: '@',
		admin: 'admin'
	})
	.config(function(localStorageServiceProvider){
		localStorageServiceProvider.setPrefix('frontend');
		// localStorageServiceProvider.setStorageCookieDomain('example.com');
		localStorageServiceProvider.setStorageType('sessionStorage');
	})
	.service('Session', ['localStorageService', function(localStorageService) {
		this.auth = {};
		this.id = null;
		this.create = function (authData) {
			this.auth = authData;
			if(authData && authData.id) {
				this.id = authData.id;
			}
		};
		this.get = function(property) {
			if(arguments.length) {
				if(this.auth && this.auth.hasOwnProperty(property))
					return this.auth[property]
			} else {
				return this.auth
			}
		};
		this.destroy = function () {
			this.auth = null;
			this.id = null;
		};
	}])
	.factory('AuthService', [
		'$rootScope', 'api', 'Session', '$q', 'AUTH_EVENTS', 'localStorageService',
		function($rootScope, api, Session, $q, AUTH_EVENTS, localStorageService) {

			var authService = {};

			authService.init = function(data) {
				Session.create(data || localStorageService.get('sessionData'))
				return Session.get()
			}

			authService.login = function login(credentials, remember) {
				var deferred = $q.defer();

				api.auth.login(credentials).then(
					function(response){
						if(remember !== false) {
							localStorageService.set('sessionData', response);
						}
						Session.create(response);
						$rootScope.$broadcast(AUTH_EVENTS.loginSuccess, response);
						deferred.resolve(response);
					},
					function(errResponse){
						$rootScope.$broadcast(AUTH_EVENTS.loginFailed, errResponse);
						deferred.reject(errResponse);
					}
				)

				return deferred.promise
			}

			authService.logout = function logout(){
				var deferred = $q.defer();
				Session.destroy();
				localStorageService.remove('sessionData');
				api.auth.logout().then(
					function(response){
						$rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
						deferred.resolve(response);
					},
					deferred.reject
				)

				return deferred.promise
			}

			authService.isAuthenticated = function isAuthenticated(){
				return !!Session.id
			}

			authService.isAuthorized = function (authorizedRoles) {
				if (!angular.isArray(authorizedRoles)) {
					authorizedRoles = [authorizedRoles];
				}
				return (authService.isAuthenticated() && authorizedRoles.indexOf(Session.get('role')) !== -1);
			};

			authService._returnState = null;

			authService.setReturnState = function(state, params) {
				authService._returnState = {
					name: state.name,
					params: params
				}
				localStorageService.set('_returnState', authService._returnState);
			}

			authService.getReturnState = function(){
				if(!authService._returnState) {
					authService._returnState = localStorageService.get('_returnState')
				}
				return authService._returnState
			}

			return authService
		}
	])
	.config(['$httpProvider', function($httpProvider) {
		$httpProvider.interceptors.push([
			'$rootScope', '$q', '$injector', 'AUTH_EVENTS', 'Session', '$log',
			function($rootScope, $q, $injector, AUTH_EVENTS, Session, $log) {

				var _request = function(config) {
					config.headers = config.headers || {};
					config.params = config.params || {};

					//config.headers.Authorization = 'Bearer ' + sid;
					//config.params.session = Session.id;
					//config.params.token = Session.token;

					if(console.time && app.DEBUG) console.time('request');

					return config;
				}

				var _responseError = function(rejection) {
					$log.error('interceptor:', rejection.status, rejection);
					$rootScope.$broadcast({
						//0: AUTH_EVENTS.notAuthenticated,
						401: AUTH_EVENTS.notAuthenticated,
						403: AUTH_EVENTS.notAuthorized,
						419: AUTH_EVENTS.sessionTimeout,
						440: AUTH_EVENTS.sessionTimeout
					}[rejection.status], rejection);

					if(rejection.status === 401) {
						Session.destroy();
					}

					return $q.reject(rejection)
				}

				var _response = function(response) {
					if (response.status === 401 || response.status === 403) {
						$rootScope.$broadcast({
							401: AUTH_EVENTS.notAuthenticated,
							403: AUTH_EVENTS.notAuthorized
						}[response.status], response);
					}
					if(response.status === 401) {
						Session.destroy();
					}
					if(console.time && app.DEBUG) {
						$log.debug(response.config.url)
						console.timeEnd('request');
					}

					return response || $q.when(response);
				}

				return {
					request: _request,
					response: _response,
					responseError: _responseError
				}
			}
		]);
	}])