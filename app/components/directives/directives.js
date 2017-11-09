'use strict';

angular.module('app.components.directives', [
	'sticky-title'
])
	.directive('autoHeight', ['$window', function($window){
		return {
			restrict: 'A',
			priority: 500,
			transclude: true,
			link: function($scope, $element, $attr){
				//var $parent = $element.parent();
				//var parentBox = $parent[0].getBoundingClientRect();
				var windowEl = angular.element($window);
				var setHeight = _.throttle(function() {
					//if ($parent.length) {
						var top = $element[0].getBoundingClientRect().top;
						var height = document.body.clientHeight - top;

						$element.css('height', height + 'px')

						if($attr.minHeight) {
							$element.css('min-height', $attr.minHeight + 'px')
						} else {
							$element.css('min-height', height + 'px')
						}
					//}
				}, 400, true);

				windowEl
					.on('resize', setHeight)
					.on('orientationchange', function(e){
						//console.info('orientationchange', e)
					});

				$attr.$observe('minHeight', function(val, newval){
					if(val && val != newval) setHeight()
				})

				setHeight()

				$scope.$on('$destroy', function(){
					windowEl
						.off('resize', setHeight)
						.off('orientationchange', setHeight);
				})
			}
		}
	}])
	.directive('pointerEventStop',
	['$window', function($window) {

		var POINTER_EVENTS = {
			'mouse': {
				start: 'mousedown',
				move: 'mousemove',
				end: 'mouseup'
			},
			'touch': {
				start: 'touchstart',
				move: 'touchmove',
				end: 'touchend',
				cancel: 'touchcancel'
			}
		};

		return {
			restrict: 'A',
			link: function($scope, $element, $attr){
				var $windowEl = angular.element($window),
					events = $attr.ngEventDisable.split(/\s+/);

				angular.forEach(events, function(event) {
					$element.bind(event, function(e) {
						e.preventDefault();
						e.stopImmediatePropagation();
						return false;
					})
				})
			}
		}
	}])
