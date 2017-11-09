(function(){
'use strict';

	/**
	 * Angular provider for configuring and instantiating as api service.
	 *
	 * @constructor
	 */
	function ApiProvider() {
		this.endpoints = {};
	}

	/**
	 * Configured/unconfigured Restangular service name to inject
	 * @type {string}
	 */
	ApiProvider.prototype.restService = 'Restangular';

	/**
	 * Adds endpoint by its route
	 * method: {
	 *  name: nameOfEndpoint'smethod apiService.method
	 *  path: append url, if not present name was used as path
	 *  method: http method get post etc. or 'getList' - default getList
	 *  params: default params for request
	 *  headers: default headers
	 *  element: default restangular element
	 * }
	 * @param [] route
	 */
	ApiProvider.prototype.addEndpoint = function(route, methods) {
		this.endpoints[route] = methods || [];
		return this
	}

	/**
	 * Function invoked by angular to get the instance of the api service.
	 * @return {Object.<string, app.ApiEndpoint>} The set of all api endpoints.
	 */
	ApiProvider.prototype.$get = ['$injector', function($injector) {
		var api = {};

		this.restangular = $injector.get(this.restService);
		var self = this;

		angular.forEach(this.endpoints, function(methods, name, endpoints) {
			var service, route;
			if(!Array.isArray(methods)) {
				service = methods.restService ? $injector.get(methods.restService) : self.restangular;
				route = methods.route || name;
				methods = methods.methods || []
			} else {
				service = self.restangular
				route = name
			}
			api[name] = service.all(route)
			if(methods.length > 0) {
				angular.forEach(methods, function(method){
					api[name].addRestangularMethod(method.name, (method.method || 'getList'), (method.path || method.name), method.params, method.headers, method.elem)
				})
			}
		})

		return api;
	}];

	angular
		.module('app.core.api', ['restangular'])
		.provider('api', ApiProvider)

}());