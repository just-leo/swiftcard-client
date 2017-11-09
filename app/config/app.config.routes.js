'use strict';
/* App routes */
angular
	.module('app.config.routes', ['ui.router', 'LocalStorageModule', 'permission', 'permission.ui'])
	.constant('DEFAULT_URL', '/app/')
	.constant('DEFAULT_ROUTE_URL', '/')
	.constant('STATES', {
		LOGINPAGE: 'root.main',
		REGISTRATION: 'root.aside.main.registration',
		DEFAULT: 'root.aside.main.default',
		MAINPAGE: 'root.aside.main.default',
		ERROR_NOTFOUND: 'root.aside.main.404'
	})
	.config([
		'$stateProvider', '$urlRouterProvider', 'STATES', 'DEFAULT_ROUTE_URL', 'DEFAULT_URL',
		function($stateProvider, $urlRouterProvider, STATES, DEFAULT_ROUTE_URL, DEFAULT_URL) {
			// Prevent router from automatic state resolving
			$urlRouterProvider.deferIntercept();

			// when there is an empty route, redirect to /
			$urlRouterProvider.when('', DEFAULT_ROUTE_URL);
			$urlRouterProvider.when('/welcome/success', function($window) {
				$window.location = DEFAULT_URL
			});
			$urlRouterProvider.otherwise(function($injector, $location) {
				var $state = $injector.get('$state');
				console.warn('[app.config.routes] location is not defined!', $state, $location);
				$state.go(STATES.MAINPAGE)
			});

			$stateProvider
				/**
				* Apply header that used on all pages
				*/
				.state({
					name: 'root',
					abstract: true,
					views: {
						header: {
							templateUrl: 'modules/header/header.view.html',
							controller: 'HeaderController',
							controllerAs: 'controller'
						}
					},
					resolve: {
						_loadHeaderModule: function($ocLazyLoad) {
							return $ocLazyLoad.load('header')
						},
						authApi: function(api) {
							return api.auth;
						},
						//newFeedsCounter: function(api){
						//	return api.feed.all('new').one('counter')
						//}
					},
					pageTitle: 'Главная страница'
				})
				.state({
					name: 'root.main',
					url: '/welcome',
					views: {
						'main@': {
							templateUrl: 'modules/welcome/welcome.html',
							controller: 'WelcomeController',
							controllerAs: 'controller'
						}
					},
					resolve: {
						_loadWelcomeModule: function($ocLazyLoad) {
							return $ocLazyLoad.load('welcome')
						},
					},
					pageTitle: 'Добро пожаловать'
				})
				.state({
					name: 'root.main.success',
					url: '/success'
				})

				/**
				* two column layout with aside on the left
				*/
				.state({
					name: 'root.aside',
					abstract: true,
					views: {
						'main@': {
							templateUrl: 'layouts/aside-main.html',
							controller: function($scope, $rootScope, AuthService, cfpLoadingBar, $state, STATES, Notification, localStorageService, cardApi, $timeout) {

								$rootScope.$on('cardSwipe', function(e, card){

									$timeout(function(){
										if(e.defaultPrevented) {
											return
										}
										$scope.swipe(card)

									}, 100)

									$scope.swipe = function(card) {
										cardApi.check({
											HardID: card
										}).then(
											function(model) {
												if(model && model.id) {
													$state.go('root.aside.main.account', {CardID: model.id})//card info
												} else {
													localStorageService.set('$card', model)
													$state.go(STATES.REGISTRATION)
												}
											},
											function(reason) {
												Notification.error({
													closeOnClick: true,
													//title: reason.data.status,
													message: reason.data ? reason.data.message : reason.statusText
												})
											}
										)
									}
								})

								$scope.logout = function(){
									cfpLoadingBar.start();
									AuthService.logout().then(function(){
										logoutSuccess()
									}, function(reason) {
										console.warn('Server rejected logout', reason);
										logoutSuccess()
									})
								}

								function logoutSuccess() {
									if(cfpLoadingBar.status() > 0) {
										cfpLoadingBar.complete()
									}
									$state.go(STATES.LOGINPAGE, null, {reload: true})
								}
							}
						}
					},
					resolve: {
						cardApi: function(api){
							return api.card;
						}
					}
				})
				.state({
					name: 'root.aside.main',
					abstract: true,
					views: {
						'content': {
							templateUrl: 'layouts/main.html'
						}
					},
					authenticate: true
				})
				//Error page
				.state({
					name: 'root.aside.main.404',
					url: '/404',
					pageTitle: 'Страница не найдена',
					views: {
						content: {
							templateUrl: 'layouts/404.html'
						}
					},
					authenticate: true
				})
				//default
				.state({
					name: 'root.aside.main.default',
					url: '/',
					pageTitle: 'Главная страница',
					views: {
						content: {
							templateUrl: 'modules/default/default.html',
							controller: 'DefaultController',
							controllerAs: 'controller'
						}
					},
					resolve: {
						_loadDefaultModule: function ($ocLazyLoad) {
							return $ocLazyLoad.load('default')
						},
						statisticsApi: function(api) {
							return api.statistics
						},
						cardsApi: function(api) {
							return api.card
						}
					},
					data: {
						permissions: {
							only: ['root.aside.main.default']
						}
					},
					authenticate: true
				})
				.state({
					name: 'root.aside.main.registration',
					url: '/registration',
					pageTitle: 'Регистрация',
					views: {
						content: {
							templateUrl: 'modules/registration/registration.html',
							controller: 'RegistrationController',
							controllerAs: 'controller'
						}
					},
					onEnter: function(localStorageService, $rootScope) {
						if(localStorageService.get('$card')) {
							localStorageService.remove('$card');
						} else {
							console.info('Redirect back...')
							$rootScope.goBack()
						}
					},
					resolve: {
						_loadRegModule: function($ocLazyLoad) {
							return $ocLazyLoad.load('registration')
						},
						groups: function(api) {
							return api.cardGroups.available()
						},
						defaultGroup: function(api, groups) {
							//var defGroup = _.find(groups, function(group){
							//	return group.IsDefaultForNewCard
							//})
							//if(!defGroup)
							return api.cardGroups.getDefault()
						},
						authApi: function(api) {
							return api.auth
						},
						cardsApi: function(api){
							return api.card
						},
						card: function(localStorageService) {
							var $card = localStorageService.get('$card');//model
							return $card
						},
						currentUser: function($rootScope) {
							return $rootScope.currentUser
						}
					},
					data: {
						permissions: {
							only: ['root.aside.main.registration']
						}
					},
					authenticate: true
				})
				.state({
					name: 'root.aside.main.account',
					url: '/account{CardID}',
					pageTitle: 'Карта',// №{{card.ShortID}}'
					views: {
						content: {
							templateUrl: 'modules/account/account.html',
							controller: 'AccountController',
							controllerAs: 'controller'
						},
						'additional-content': {
							templateUrl: 'modules/account/finances/finance-list.html',
							controller: 'AccountFinanceListController',
							controllerAs: 'controller'
						}
					},
					resolve: {
						_loadAccountModule: function($ocLazyLoad) {
							return $ocLazyLoad.load('account')
						},
						_loadFinancesModule: function($ocLazyLoad) {
							return $ocLazyLoad.load('finances')
						},
						cardApi: function(api){
							return api.card;
						},
						card: function(cardApi, $stateParams) {
							return cardApi.get($stateParams.CardID, {expand: 'account,group'})
						},
						financesApi: function(api){
							return api.finances
						}
					},
					data: {
						permissions: {
							only: ['root.aside.main.account']
						}
					},
					authenticate: true

				})
				.state({
					name: 'root.aside.main.cards',
					url: '/cards',
					pageTitle: 'Карты',
					views: {
						'content': {
							templateUrl: 'modules/cards/card-list.html',
							controller: 'CardListController',
							controllerAs: 'controller'
						}
					},
					resolve: {
						_loadCardsModule: function($ocLazyLoad) {
							return $ocLazyLoad.load('cards')
						},
						cardsApi: function(api) {
							return api.card
						},
						cardGroupsList: function(api) {
							return api.cardGroups.getList()
						},
						accountLevelsList: function(api) {
							return api.accountLevels.getList()
						}
					},
					data: {
						permissions: {
							only: ['root.aside.main.cards']
						}
					},
					authenticate: true
				})
				.state({
					name: 'root.aside.main.card-groups',
					url: '/card/groups',
					pageTitle: 'Группы пользователей',
					views: {
						'content': {
							templateUrl: 'modules/cards/card-group-list.html',
							controller: 'CardGroupListController',
							controllerAs: 'controller'
						}
					},
					resolve: {
						_loadCardsModule: function($ocLazyLoad) {
							return $ocLazyLoad.load('cards')
						},
						cardGroupsApi: function(api) {
							return api.cardGroups;
						}
					},
					data: {
						permissions: {
							only: ['root.aside.main.card-groups']
						}
					},
					authenticate: true
				})
				.state({
					name: 'root.aside.main.account-levels',
					url: '/card/levels',
					pageTitle: 'Уровни пользователей',
					views: {
						'content': {
							templateUrl: 'modules/cards/account-level-list.html',
							controller: 'AccountLevelListController',
							controllerAs: 'controller'
						}
					},
					resolve: {
						_loadCardsModule: function($ocLazyLoad) {
							return $ocLazyLoad.load('cards')
						},
						accountLevelsApi: function(api) {
							return api.accountLevels;
						}
					},
					data: {
						permissions: {
							only: ['root.aside.main.account-levels']
						}
					},
					authenticate: true
				})
				.state({
					name: 'root.aside.main.objects',
					url: '/objects',
					pageTitle: 'Объекты',
					views: {
						'content': {
							templateUrl: 'modules/objects/object-list.html',
							controller: 'ObjectListController',
							controllerAs: 'controller'
						}
					},
					resolve: {
						_loadObjectsModule: function($ocLazyLoad) {
							return $ocLazyLoad.load('objects')
						},
						objectsApi: function(api) {
							return api.objects;
						}
					},
					data: {
						permissions: {
							only: ['root.aside.main.objects']
						}
					},
					authenticate: true
				})
				.state({
					name: 'root.aside.main.object',
					url: '/object{ID}',
					pageTitle: 'Объект',
					views: {
						'content': {
							templateUrl: 'modules/objects/object.html',
							controller: 'ObjectController',
							controllerAs: 'controller'
						}
					},
					resolve: {
						_loadObjectsModule: function($ocLazyLoad) {
							return $ocLazyLoad.load('objects')
						},
						object: function(api, $stateParams) {
							return api.objects.get($stateParams.ID)
						}
					},
					data: {
						permissions: {
							only: ['root.aside.main.object']
						}
					},
					authenticate: true
				})
				.state({
					name: 'root.aside.main.logs',
					url: '/logs',
					pageTitle: 'Системный журнал',
					views: {
						'content': {
							templateUrl: 'modules/logs/logs-list.html',
							controller: 'LogListController',
							controllerAs: 'controller'
						}
					},
					resolve: {
						_loadLogsModule: function($ocLazyLoad) {
							return $ocLazyLoad.load('logs')
						},
						logsApi: function(api) {
							return api.log;
						}
					},
					data: {
						permissions: {
							only: ['root.aside.main.logs']
						}
					},
					authenticate: true
				})
				.state({
					name: 'root.aside.main.actions',
					url: '/actions',
					pageTitle: 'Акции',
					views: {
						'content': {
							templateUrl: 'modules/actions/action-list.html',
							controller: 'ActionListController',
							controllerAs: 'controller'
						}
					},
					resolve: {
						_loadActionsModule: function($ocLazyLoad) {
							return $ocLazyLoad.load('actions')
						},
						actionsApi: function(api) {
							return api.action;
						},
						actionClasses: function(actionsApi){
							return actionsApi.all('classes').getList()
						},
						objectApi: function(api) {
							return api.objects
						}
					},
					data: {
						permissions: {
							only: ['root.aside.main.actions']
						}
					},
					authenticate: true
				})
				.state({
					name: 'root.aside.main.cash',
					url: '/cash',
					pageTitle: 'Счета',
					views: {
						'content': {
							templateUrl: 'modules/cash/cash-list.html',
							controller: 'CashController',
							controllerAs: 'controller'
						}
					},
					resolve: {
						_loadCashModule: function($ocLazyLoad) {
							return $ocLazyLoad.load('cash')
						},
						cashList: function(api) {
							return api.cash.getList();
						},
						lastRecord: function(api) {
							return api.cash.last()
						}
					},
					data: {
						permissions: {
							only: ['root.aside.main.cash']
						}
					},
					authenticate: true
				})
				.state({
					name: 'root.aside.main.report',
					url: '/report',
					pageTitle: 'Отчеты',
					views: {
						'content': {
							templateUrl: 'modules/report/report.html',
							controller: 'ReportController',
							controllerAs: 'controller'
						}
					},
					resolve: {
						_loadCashModule: function($ocLazyLoad) {
							return $ocLazyLoad.load('report')
						},
						Api: function(api) {
							return api.report
						}
					},
					data: {
						permissions: {
							only: ['root.aside.main.report']
						}
					},
					authenticate: true
				})
/*
            $futureStateProvider.addResolve(function($q){
            })
			$futureStateProvider.futureState({

			})
*/
		}
	])
	.run([
		'$rootScope', '$state', '$log',
		function($rootScope, $state, $log){

			$rootScope.$state = $state;

			$rootScope.$on('$stateChangeroot',
				function(event, toState, toParams, fromState, fromParams){
					$log.info(event.name, toState.name);
				})
			$rootScope.$on('$stateChangeSuccess',
				function(event, toState, toParams, fromState, fromParams){
					$log.info(event.name, toState.name);
				})
			$rootScope.$on('$stateChangeError',
				function(event, toState, toParams, fromState, fromParams, error){
					$log.error(event.name, error)
					$log.info(event, toState, toParams, fromState, fromParams)
				})
			$rootScope.$on('$stateNotFound',
				function(event, unfoundState, fromState, fromParams){
					$log.warn(event.name, unfoundState.to);
					$log.warn(unfoundState.toParams);
					$log.warn(unfoundState.options); // {inherit:false} + default options

					var toState = unfoundState.to,
						toStateParent = toState;

					//if (toState.name.indexOf(".")) {
					//	// Check if parent state is a valid state
					//	var firstToState = toState.name.split(".")[0];
					//	if ($state.get(firstToState)) {
					//		$log.log("Parent state '" + firstToState + "' found for '" + toState + "'" );
					//		toStateParent = firstToState;
                    //
                    //
					//		// Load first the parent state
					//		$state.go(toStateParent).then(function (resolved) {
					//			// Only go to final state if it exists.
					//			if ($state.get(toState)) {
					//				return $state.go(toState);
					//			} else {
					//				// Go back to calling state
					//				$log.log("Going back to ", fromState);
					//				return $state.go(fromState.name);
					//			}
					//		});
					//		event.preventDefault();
					//	} else {
							$log.error(toState, " state not found.");
					//	}
					//}

				})
		}
	])