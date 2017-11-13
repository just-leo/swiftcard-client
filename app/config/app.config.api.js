'use strict';

angular
	.module('app.config.api', [
		'restangular'
	])
	.constant('ALLOW_PUBLIC_API', false)
	.config(['RestangularProvider', 'ALLOW_PUBLIC_API', function(RestangularProvider, ALLOW_PUBLIC_API) {
		var host = location.host;
		if((host.indexOf('localhost') > -1) || (host.indexOf('127.0.0.1') > -1)) {
			RestangularProvider.setBaseUrl('http://localhost:3000');
		} else if(ALLOW_PUBLIC_API){
			RestangularProvider.setBaseUrl(location.protocol + '//' + location.hostname + ':3000');
		} else {
			RestangularProvider.setBaseUrl('http://192.168.0.100:3000');
		}

		RestangularProvider.setDefaultHttpFields(
			{
				withCredentials: true,
				cache: false,
				_format: 'json'
			}
		)

		RestangularProvider.setFullResponse(false)

		// In this case we are mapping the id of each element to the _id field.
		// We also change the Restangular route.
		// The default value for parentResource remains the same.
		RestangularProvider.setRestangularFields({
			id: "ID",
			//selfLink: "self.href"
		})

		RestangularProvider.setResponseExtractor(function(response, operation) {
			if('getList' === operation && angular.isArray(response.items)) {
				var result = response.items;
				result._meta = response._meta;
				return result
			} else {
				return response
			}
		})
	}])
	.factory('CardRest', ['Restangular', function(Restangular) {
		//Decoupled Restangular
		return Restangular.withConfig(function(RestangularConfigurer) {
			/**
			 * data response body
			 * operation getList|POST|..
			 * what url path
			 * url requested url
			 * response xhr response
			 * deferred deferred
			 */
			RestangularConfigurer.addResponseInterceptor(function(data, operation, what, url, response, deferred) {
				if(operation === 'getList' && Array.isArray(data) && data.length && angular.isDefined(data[0].account)) {
					//for(var i = 0, l = data.length; i< l; i++) {
					//	//data[i].account = Restangular.restangularizeElement(null, data[i].account, 'account', true);
					//}
					return data
				} else {
					if(data.account) {
						data.account = Restangular.restangularizeElement(null, data.account, 'account', true)
						if(data.account.level)
							data.account.level = Restangular.restangularizeElement(data.account, data.account.level, 'level', true)
					}
					if(data.group) {
						data.group = Restangular.restangularizeElement(data, data.group, 'group', true)
					}
					return data
				}
			})
		})
	}])
	.config(['apiProvider', function(apiProvider){

		//apiProvider.restService = '';

		apiProvider
			.addEndpoint('objects', {
				route: 'objects'
			})
			.addEndpoint('card', {
				restService: 'CardRest',
				methods: [
					{
						name: 'check',
						method: 'post'
					},
					{
						name: 'repair',
						method: 'post'
					},
					{
						name: 'change',
						method: 'post'
					},
					{
						name: 'search'
					}
				]
			})
			.addEndpoint('cardGroups', {
				route: 'card-groups',
				methods: [
					{
						name: 'available'
					},
					{
						name: 'getDefault',
						method: 'get',
						path: 'get-default'
					}
				]
			})
			.addEndpoint('accounts', {
				methods: [
					{
						name: 'charge-balance',
						method: 'post'
					},
					{
						name: 'release-balance',
						method: 'post'
					},
					{
						name: 'tickets-add',
						method: 'post'
					},
					{
						name: 'tickets-exchange',
						method: 'post'
					},
					{
						name: 'bonusesAdd',
						path: 'bonuses-add',
						method: 'post'
					},
					{
						name: 'bonuses-release',
						method: 'post'
					}
				]
			})
			.addEndpoint('accountLevels', {
				route: 'levels'
			})
			.addEndpoint('finances', [
				{
					name: 'cancel',
					method: 'post'
				},
				{
					name: 'apply',
					method: 'post'
				}
			])
			.addEndpoint('static')
			.addEndpoint('statistics', [
				{
					name: 'default',
					method: 'get'
				}
			])
			.addEndpoint('auth', [
				{
					name: 'login',
					path: 'login/by-card',
					method: 'post'
				},
				{
					name: 'logout',
					path: 'login/logout',
					method: 'post'
				},
				{
					name: 'registration',
					path: 'login',
					method: 'post'
				},
				{
					name: 'check',
					path: 'login/check',
					method: 'get'
				}
			])
			.addEndpoint('log')
			.addEndpoint('action')
			.addEndpoint('cash', [
				{
					name: 'last',
					method: 'get'
				}
			])
			.addEndpoint('report')
	}])
