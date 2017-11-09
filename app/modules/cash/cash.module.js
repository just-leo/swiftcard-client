angular
    .module('cash', ['ui-notification', 'ngTable', 'angularMoment', 'angular-virtual-keyboard'])
    .controller('CashController', function CashController($scope, Notification, cashList, lastRecord) {

        var self = this;

        $scope.data = lastRecord;

        $scope.showCashBoxForm = false
        $scope.showSafeForm = false

        //Свойства указ сколько нужно отнять из значения одноименного атрибута
        $scope.model = {CashBox: 0, Safe: 0}

        //Перемещение в сейф
        this.setToSafe = function() {
            $scope.model.Safe = 0
            $scope.model.CashBox = $scope.data.CashBox
            $scope.showCashBoxForm = true
            $scope.showSafeForm = false
        }

        //из сейфа
        this.setToPickup = function() {
            $scope.model.Safe = $scope.data.Safe
            $scope.model.CashBox = 0
            $scope.showCashBoxForm = false
            $scope.showSafeForm = true
        }

        this.reset = function() {
            $scope.showCashBoxForm = false
            $scope.showSafeForm = false
            $scope.model.Safe = 0
            $scope.model.CashBox = 0
        }

        this.save = function() {
            cashList.post($scope.model).then(function(lastRecord) {
                $scope.data = lastRecord

                if($scope.model.CashBox > 0) {
                    Notification.success('Выручка кассы перемещеана в сейф')
                } else if($scope.model.Safe) {
                    Notification.success('Инкассация прошла успешно')
                }

                self.reset()
            }, function(errResponse){
                Notification.error({
                    title: 'Ошибка ' + errResponse.status,
                    message: errResponse.data ? errResponse.data.message : errResponse.statusText
                })
            })
        }

    })