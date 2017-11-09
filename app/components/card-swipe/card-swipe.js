angular
    .module('card-swipe', [])
    .directive('cardSwipe', function($parse, $document, $rootScope, $timeout, $log) {
        return {
            restrict: 'A',
            priority: 500,
            link: function ($scope, $element, $attrs) {
                $log.warn('SWIPE enabled')

                var id = '',
                    started = false,
                    eventPrefix = angular.isDefined($attrs.cardSwipeEventPrefix) ? $attrs.cardSwipeEventPrefix + ':' : '';

                var timer = null;

                function cardHandler(e) {
                    //e.stopImmediatePropagation();
                    //e.stopPropagation();

                    if (started) {
//                    e.preventDefault();
                    }

                    //$log.debug(e.which, String.fromCharCode(e.which))
                    if (!started && [1078, 59, 186, 0, 63, 37].indexOf(e.which) > -1 || e.key === ';') {
                        id = '';
                        started = true;
                        if(timer === null) {
                            timer = $timeout(function() {
                                if(started) started = false;
                                timer = null;
                                $log.log('swipe reset', id)
                            }, 500)
                        }
                        //console.time('swipe')
                        //beforeStart($scope, {e: e});
                    } else if ([44, 63, 191, 16, 190].indexOf(e.which) > -1) {

                    } else if (e.which === 13 && started) {
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        e.stopPropagation();

                        started = false;
                        if($attrs.cardSwipe) {
                            //$parse($attrs.cardSwipe)($scope, {str: id});
                        }
                        $rootScope.$broadcast(eventPrefix + 'cardSwipe', id);
                        //console.timeEnd('swipe')
                        if(timer) {
                            $timeout.cancel(timer);
                            timer = null;
                            $log.log('swipe OK', id)
                        }
                        //if (input) {
                        //    input.off('submit keydown')
                        //}
                        return false;
                    } else if (started) {
                        var char = (e.key === undefined) ? String.fromCharCode(e.which) : e.key;
                        id += char
                    }

                }

                var $bodyEl = angular.element($document[0].body);

                    $bodyEl.on("keypress", cardHandler);

                $scope.$on('$destroy', function() {
                    $bodyEl.off("keypress", cardHandler);

                    $log.warn('SWIPE Destroyed')
                })
            }
        }
    })