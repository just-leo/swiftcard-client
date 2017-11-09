'use strict';
/* App config */
angular
	.module('app.config', [
		'app.config.autoload',
		'app.config.api',
		'app.config.routes'
	])
	.config(['$locationProvider', function($locationProvider){
		$locationProvider.html5Mode({
			enabled: false,
			requireBase: false
		})
	}])
	.config(['$logProvider', function($logProvider) {
		$logProvider.debugEnabled(app.DEBUG)
	}])
	.config(['$compileProvider', function ($compileProvider) {
		$compileProvider.debugInfoEnabled(app.DEBUG);
	}])
