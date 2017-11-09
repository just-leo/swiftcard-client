angular
    .module('account')
    .controller('AccountController', function AccountController($scope, $rootScope, cardApi, card, $modal, Notification, transactionsRefreshInterval, $interval){

        var isFirstCharge = card.account.Money == 0 && card.account.Charged == 0 && card.account.Spend == 0 && card.account.InPawn == 0;

        $scope.card = card;

        $rootScope.pageTitle = $rootScope.pageTitle + ' №' + card.ShortID;

        $scope.chargeBalance = function() {
            $modal({
                title: (card.account.isNewAccount ? 'Зарегистрирована карта №' : 'Пополнение карты №') + card.ShortID,
                show: true,
                size: 'lg',
                backdrop: 'static',
                keyboard: false,
                prefixEvent: 'ChargeBalanceModal',
                resolve: {
                    card: function(){
                        return card
                    },
                    chargeApi: function() {
                        return card.account.all('charge-balance')
                    }
                },
                contentTemplate: 'account/charge-balance.html',
                controller: function($scope, card, chargeApi) {
                    $scope.hideFooter = true;

                    $scope.card = card;

                    $scope.cash = {
                        sum: '',//сумма пополнения
                        money: '',
                        change: '',
                        resultSum: 0
                    }

                    $scope.calculate = function() {
                        $scope.cash.change = $scope.cash.money - $scope.cash.sum;
                        if(card.account.isNewAccount) {
                            $scope.cash.resultSum = $scope.cash.sum - card.group.EmitCardCost - card.group.CardDeposit;
                            if($scope.cash.resultSum < 0) {
                                $scope.cash.resultSum = 0
                            }
                        } else {
                            $scope.cash.resultSum = $scope.cash.sum
                        }
                    }

                    $scope.updateBalance = function() {
                        if(!$scope.$accountChargeForm || $scope.$accountChargeForm.$invalid) return;
                        chargeApi.post({
                            Money: $scope.cash.sum
                        }).then(function(account) {
                            angular.extend(card.account, account.plain());
                            Notification.success({
                                message: 'Баланс <strong>' + account.Money + 'грн + ' + account.Bonuses + 'грн бонус </strong>'
                            })
                            $scope.$accountChargeForm.$setSubmitted(false)
                            $scope.$hide()
                        }, function(errResponse) {
                            $scope.$accountChargeForm.$submitted = false
                            $scope.serverErrors = _.keyBy(errResponse.data, 'field')
                            if(errResponse.status === 422){
                                angular.forEach($scope.serverErrors, function(field){
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
                        })
                    }

                    $scope.isFirstCharge = card.account.isNewAccount;
                },
                onHide: function($modal){
                    $modal.destroy()
                    //refresh
                    reloadFinances()
                }
            })
        }

        $scope.releaseBalance = function() {
            $modal({
                title: 'Снятие средств с карты №' + card.ShortID,
                show: true,
                size: 'lg',
                backdrop: 'static',
                prefixEvent: 'ReleaseBalanceModal',
                resolve: {
                    card: function(){
                        return card
                    },
                    chargeApi: function() {
                        return card.account.all('release-balance')
                    }
                },
                contentTemplate: 'account/release-balance.html',
                controller: function($scope, card, chargeApi) {
                    $scope.hideFooter = true;

                    $scope.card = card;

                    $scope.cash = {
                        sum: '',
                        money: card.account.Money,
                    }

                    $scope.updateBalance = function() {
                        if(!$scope.$accountChargeForm || $scope.$accountChargeForm.$invalid) return;
                        //$scope.$accountChargeForm.$setSubmitted(true)

                        chargeApi.post({
                            Money: $scope.cash.sum
                        }).then(function(account) {
                            angular.extend(card.account, account.plain());
                            Notification.success({
                                message: 'Баланс <strong>' + account.Money + 'грн + ' + account.Bonuses + 'грн бонус </strong>'
                            })
                            $scope.$accountChargeForm.$setSubmitted(false)
                            $scope.$hide()
                        }, function(errResponse) {
                            $scope.$accountChargeForm.$setSubmitted(false)
                            //@todo show errors
                            $scope.serverErrors = _.keyBy(errResponse.data, 'field')
                            if(errResponse.status === 422){
                                angular.forEach($scope.serverErrors, function(field){
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
                        })
                    }
                },
                onHide: function($modal){
                    $modal.destroy()
                    //refresh
                    reloadFinances()
                }
            })
        }

        this.bonusesAdd = function() {
            $modal({
                title: 'Пополнить бонусный счет карты №' + card.ShortID,
                show: true,
                size: 'lg',
                backdrop: 'static',
                resolve: {
                    card: function(){
                        return card
                    },
                    Api: function() {
                        return card.account.all('bonuses-add')
                    }
                },
                contentTemplate: 'account/tickets-exchange.html',
                controller: function($scope, card, Api) {
                    $scope.hideFooter = true;

                    $scope.card = card;

                    $scope.tickets = {
                        count: ''
                    }

                    $scope.submit = function() {
                        if(!$scope.$ticketsExchangeForm || $scope.$ticketsExchangeForm.$invalid) return;

                        Api.post({
                            Count: $scope.tickets.count
                        }).then(function(account) {
                            angular.extend(card.account, account.plain());
                            Notification.success({
                                message: 'Баланс <strong>' + account.Bonuses + ' ' + plural(account.Bonuses, 'бонус', 'бонуса', 'бонусов') + ' </strong>'
                            })
                            $scope.$ticketsExchangeForm.$setSubmitted(false)
                            $scope.$hide()
                        }, function(errResponse) {
                            $scope.$ticketsExchangeForm.$setSubmitted(false)
                            //@todo show errors
                            $scope.serverErrors = _.keyBy(errResponse.data, 'field')
                            if(errResponse.status === 422){
                                angular.forEach($scope.serverErrors, function(field){
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
                        })
                    }
                },
                onHide: function($modal){
                    $modal.destroy()
                    //refresh
                    reloadFinances()
                }
            })
        }

        this.bonusesRelease = function() {
            $modal({
                title: 'Снятие средств с бонусного счета карты №' + card.ShortID,
                show: true,
                size: 'lg',
                backdrop: 'static',
                resolve: {
                    card: function(){
                        return card
                    },
                    Api: function() {
                        return card.account.all('bonuses-release')
                    }
                },
                contentTemplate: 'account/tickets-exchange.html',
                controller: function($scope, card, Api) {
                    $scope.hideFooter = true;

                    $scope.card = card;

                    $scope.tickets = {
                        count: '',
                        max: card.account.Tickets
                    }

                    $scope.submit = function() {
                        if(!$scope.$ticketsExchangeForm || $scope.$ticketsExchangeForm.$invalid) return;

                        Api.post({
                            Count: $scope.tickets.count
                        }).then(function(account) {
                            angular.extend(card.account, account.plain());
                            Notification.success({
                                message: 'Баланс <strong>' + account.Bonuses + ' ' + plural(account.Bonuses, 'бонус', 'бонуса', 'бонусов') + ' </strong>'
                            })
                            $scope.$ticketsExchangeForm.$setSubmitted(false)
                            $scope.$hide()
                        }, function(errResponse) {
                            $scope.$ticketsExchangeForm.$setSubmitted(false)
                            $scope.serverErrors = _.keyBy(errResponse.data, 'field')
                            if(errResponse.status === 422){
                                angular.forEach($scope.serverErrors, function(field){
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
                        })
                    }
                },
                onHide: function($modal){
                    $modal.destroy()
                    //refresh
                    reloadFinances()
                }
            })
        }

        this.ticketsAdd = function() {
            $modal({
                title: 'Возврат билетов на карту №' + card.ShortID,
                show: true,
                size: 'lg',
                backdrop: 'static',
                prefixEvent: 'TicketsAddModal',
                resolve: {
                    card: function(){
                        return card
                    },
                    Api: function() {
                        return card.account.all('tickets-add')
                    }
                },
                contentTemplate: 'account/tickets-exchange.html',
                controller: function($scope, card, Api) {
                    $scope.hideFooter = true;

                    $scope.card = card;

                    $scope.tickets = {
                        count: ''
                    }

                    $scope.submit = function() {
                        if(!$scope.$ticketsExchangeForm || $scope.$ticketsExchangeForm.$invalid) return;

                        Api.post({
                            Count: $scope.tickets.count
                        }).then(function(account) {
                            angular.extend(card.account, account.plain());
                            Notification.success({
                                message: 'Баланс <strong>' + account.Tickets + ' ' + plural(account.Tickets, 'билет', 'билета', 'билетов') + ' </strong>'
                            })
                            $scope.$ticketsExchangeForm.$setSubmitted(false)
                            $scope.$hide()
                        }, function(errResponse) {
                            $scope.$ticketsExchangeForm.$setSubmitted(false)
                            //@todo show errors
                            $scope.serverErrors = _.keyBy(errResponse.data, 'field')
                            if(errResponse.status === 422){
                                angular.forEach($scope.serverErrors, function(field){
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
                        })
                    }
                },
                onHide: function($modal){
                    $modal.destroy()
                    //refresh
                    reloadFinances()
                }
            })
        }

        this.ticketsExchange = function() {
            $modal({
                title: 'Обмен билетов на товар. Карта №' + card.ShortID,
                show: true,
                size: 'lg',
                backdrop: 'static',
                prefixEvent: 'TicketsExchangeModal',
                resolve: {
                    card: function(){
                        return card
                    },
                    Api: function() {
                        return card.account.all('tickets-exchange')
                    }
                },
                contentTemplate: 'account/tickets-exchange.html',
                controller: function($scope, card, Api) {
                    $scope.hideFooter = true;

                    $scope.card = card;

                    $scope.tickets = {
                        count: '',
                        max: card.account.Tickets
                    }

                    $scope.submit = function() {
                        if(!$scope.$ticketsExchangeForm || $scope.$ticketsExchangeForm.$invalid) return;

                        Api.post({
                            Count: $scope.tickets.count
                        }).then(function(account) {
                            angular.extend(card.account, account.plain());
                            Notification.success({
                                message: 'Баланс <strong>' + account.Tickets + ' ' + plural(account.Tickets, 'билет', 'билета', 'билетов') + ' </strong>'
                            })
                            $scope.$ticketsExchangeForm.$setSubmitted(false)
                            $scope.$hide()
                        }, function(errResponse) {
                            $scope.$ticketsExchangeForm.$setSubmitted(false)
                            $scope.serverErrors = _.keyBy(errResponse.data, 'field')
                            if(errResponse.status === 422){
                                angular.forEach($scope.serverErrors, function(field){
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
                        })
                    }
                },
                onHide: function($modal){
                    $modal.destroy()
                    //refresh
                    reloadFinances()
                }
            })
        }

        this.accountBlockToggle = function() {
            var Api = card.account.Blocked ? card.account.one('unblock') : card.account.one('block')

            Api.post().then(
                function(account){
                    angular.extend(card.account, account.plain());
                    if(account.Blocked) {
                        Notification.error({
                            //title: 'Ошибка',
                            message: 'Аккаунт заблокирован'
                        })
                    } else {
                        Notification.success({
                            //title: 'Ошибка',
                            message: 'Аккаунт разблокирован'
                        })
                    }
                },
                function(errResponse){
                    Notification.error({
                        title: 'Ошибка ' + errResponse.status + ' при попытке заблокировать аккаунт',
                        message: errResponse.data ? errResponse.data.message : errResponse.statusText
                    })
                }
            )
        }

        this.accountDelete = function(){
            var Api = card.account.one('soft-delete');

            Api.post().then(
                function(account){
                    angular.extend(card.account, account.plain());
                    if(account.Deleted) {
                        Notification.error({
                            //title: 'Ошибка',
                            message: 'Аккаунт удален'
                        })
                    } else {
                        Notification.warning({
                            title: 'Ошибка',
                            message: 'Аккаунт не удален'
                        })
                    }
                },
                function(errResponse){
                    Notification.error({
                        title: 'Ошибка ' + errResponse.status + ' при попытке удалить аккаунт',
                        message: errResponse.data ? errResponse.data.message : errResponse.statusText
                    })
                }
            )
        }

        this.accountUnDelete = function(){
            var Api = card.account.one('undelete')

            Api.post().then(
                function(account){
                    angular.extend(card.account, account.plain());
                    if(!account.Deleted) {
                        Notification.error({
                            //title: 'Ошибка',
                            message: 'Аккаунт восстановлен'
                        })
                    } else {
                        Notification.warning({
                            //title: 'Ошибка',
                            message: 'Аккаунт не восстановлен'
                        })
                    }
                },
                function(errResponse){
                    Notification.error({
                        title: 'Ошибка при попытке восстановить аккаунт',
                        message: errResponse.data ? errResponse.data.message : errResponse.statusText
                    })
                }
            )
        }

        this.changeCard = function changeCard(repair) {
            if(repair && card.account.Money < card.group.CardRepairCost) {
                Notification.error({
                    title: 'Недостаточно средств',
                    message: 'чтобы выполнить восстановление карты'
                })
                return;
            }

            $modal({
                title: 'Замена карты №' + card.ShortID + (repair ? ' (восстановление)' : ''),
                show: true,
                backdrop: 'static',
                prefixEvent: 'CardChangeModal',
                resolve: {
                    card: function(){
                        return card
                    },
                    cardApi: function() {
                        return cardApi
                    }
                },
                contentTemplate: 'card/exchange.html',
                controller: function($scope, $rootScope, card, cardApi) {

                    var offSwipe = $rootScope.$on('cardSwipe', function(e, HardID){
                        e.preventDefault()

                        if(HardID === card.HardID) {
                            Notification.warning({
                                //title: reason.data.status,
                                message: 'Попробуйте новую карту'
                            })
                            return
                        }

                        cardApi.check({
                            HardID: HardID
                        }).then(
                            function(model) {
                                if(model && model.id) {
                                    Notification.error({
                                        //title: reason.data.status,
                                        message: 'Эта карта уже зарегистрирована!'
                                    })
                                }

                                card.all(repair ? 'repair' : 'change').post({
                                    HardID: HardID
                                }).then(function (result) {
                                    angular.extend(card, result);
                                    offSwipe()
                                    Notification.success({
                                        //title: reason.data.status,
                                        message: 'Замена карты выполнена успешно'
                                    })
                                    $scope.$hide()
                                }, function (errResponse) {

                                    $scope.serverErrors = _.keyBy(errResponse.data, 'field')
                                    if (errResponse.status === 422) {
                                        angular.forEach($scope.serverErrors, function (field) {
                                            Notification.error({
                                                title: 'Ошибка',
                                                message: field.message
                                            })
                                        })
                                    } else {
                                        Notification.error({
                                            title: 'Ошибка',
                                            message: errResponse.message ? errResponse.message : errResponse.statusText
                                        })
                                    }

                                })

                            },
                            function(errResponse) {
                                Notification.error({
                                    title: 'Ошибка ' + errResponse.status,
                                    message: errResponse.data ? errResponse.data.message : errResponse.statusText
                                })
                            }
                        )
                    })

                    $scope.hideFooter = true;

                    $scope.$on('$destroy', offSwipe)
                },
                onHide: function($modal){
                    $modal.destroy()
                    //refresh
                    reloadFinances()
                    //$scope.card = card.get().$object
                }
            })
        }

        //требуется пополнение?
        if(card.account.isNewAccount && (!card.group.IsMandatory && !card.ServiceCard)) {
            $scope.chargeBalance()
        }

        function reloadFinances() {
            $rootScope.$broadcast('account.finances:reload', card)
        }

        var refreshInterval = $interval(reloadFinances, transactionsRefreshInterval)

        $scope.$on('account.account:reload', function(e){
            card.get().then(function(resource){
                angular.extend($scope.card, resource.plain())
            })
        })

        $scope.$on('$destroy', function() {
            $interval.cancel(refreshInterval)
        })

        function plural(n, str1, str2, str3){
            if ( n % 10 == 1 && n % 100 != 11 ) return str1
            else if ( n % 10 >= 2 && n % 10 <= 4 && ( n % 100 < 10 || n % 100 >= 20)) return str2
            else return str3;
        }
    })