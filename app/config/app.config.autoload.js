'use strict'
/* Lazy loader module-config */
angular
	.module('app.config.autoload', [
		'oc.lazyLoad'
	])
	.constant('autoloaderDebugMode', false)
	.constant('modulesToLoad', [
		{
			name: 'header',
			serie: true,
			files: [
				'modules/header/header.module.js',
				'modules/header/header.controller.js'
			]
		},
		{
			name: 'welcome',
			files: [
				'modules/welcome/welcome.module.js'
			]
		},
		{
			name: 'default',
			files: [
				'modules/default/default.module.js'
			]
		},
		{
			name: 'registration',
			serie: true,
			files: [
				'modules/registration/registration.module.js',
				'modules/registration/registration.controller.js'
			]
		},
		//{
		//	name: 'card-swipe',
		//	files: [
		//		'components/card-swipe/card-swipe.js'
		//	]
		//},
		{
			name: 'objects',
			serie: true,
			files: [
				'modules/objects/objects.module.js',
				'modules/objects/object-list.controller.js',
				'modules/objects/object.controller.js'
			]
		},
		{
			name: 'cards',
			serie: true,
			files: [
				'modules/cards/cards.module.js',
				'modules/cards/card-list.controller.js',
				'modules/cards/card-group-list.controller.js',
				'modules/cards/account-level-list.controller.js'
			]
		},
		{
			name: 'account',
			serie: true,
			files: [
				'modules/account/account.module.js',
				'modules/account/account.controller.js'
			]
		},
		{
			name: 'finances',
			serie: true,
			files: [
				'modules/account/finances/finances.module.js',
				'modules/account/finances/account-finance-list.controller.js'
			]
		},
		{
			name: 'logs',
			serie: true,
			files: [
				'modules/logs/logs.module.js',
				'modules/logs/log-list.controller.js'
			]
		},
		{
			name: 'actions',
			serie: true,
			files: [
				'modules/actions/actions.module.js',
				'modules/actions/action-list.controller.js',
				'modules/actions/action.controller.js'
			]
		},
		{
			name: 'cash',
			files: [
				'modules/cash/cash.module.js'
			]
		},
		{
			name: 'report',
			files: [
				'modules/report/report.module.js',
				'../node_modules/file-saver/FileSaver.min.js'
			]
		},
		{
			name: 'cron-control',
			serie: true,
			files: [
				'../node_modules/jquery/dist/jquery.js',
				'components/cron/jqcron/src/jqCron.js',
				'components/cron/cron-control.js',
				'components/cron/jqcron/src/jqCron.css'
			]
		},
		{
			name: 'ngTable',
			files: [
				'../node_modules/ng-table/dist/ng-table.min.js',
				'../node_modules/ng-table/dist/ng-table.min.css'
			]
		},
		{
			name: 'ui.select',
			files: [
				'../node_modules/ui-select/dist/select.min.js'
			]
		},
		//{
		//	name: 'angular-virtual-keyboard',
		//	files: [
		//		'../node_modules/angular-virtual-keyboard/release/angular-virtual-keyboard.min.js',
		//		'../node_modules/angular-virtual-keyboard/release/angular-virtual-keyboard.css'
		//	]
		//},
		{
			name: 'xeditable',
			files: [
				'../node_modules/angular-xeditable/dist/js/xeditable.min.js',
				'../node_modules/angular-xeditable/dist/css/xeditable.min.css'
			]
		}
	])
	.config([
		'$ocLazyLoadProvider', 'modulesToLoad', 'autoloaderDebugMode',
		function($ocLazyLoadProvider, modulesToLoad, autoloaderDebugMode) {
			//if(debug) {
			//	angular.forEach(modules, function (module) {
			//		module.cache = false
			//	})
			//}

			$ocLazyLoadProvider.config({
				debug: autoloaderDebugMode,
				events: false,
				modules: modulesToLoad,
				jsLoader: function (paths, callback, params) {
					debugger
					params.serie ? $script.order(paths, callback) : $script(paths, callback)
				},
			})
		}
	])