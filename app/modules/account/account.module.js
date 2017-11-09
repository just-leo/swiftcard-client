angular
    .module('account', ['ui-notification', 'ngTable', 'angularMoment', 'mgcrea.ngStrap.dropdown', 'mgcrea.ngStrap.modal', 'angular-virtual-keyboard', 'card-swipe'])
    .constant('transactionsRefreshInterval', 20000)
    .run(function(VKI_CONFIG) {
        VKI_CONFIG.layout['Numerico'] = {
            'name': 'Numerico', 'keys': [
                [['1', '1'], ['2', '2'], ['3', '3'], ['  С ', 'Bksp']],
                [['4', '4'], ['5', '5'], ['6', '6'], ['  ↵ ', 'Enter']],
                [['7', '7'], ['8', '8'], ['9', '9'], ['  . ', '.']],//[',', ',']
                [['                     0                       ', '0']]
            ], 'lang': ['ru'] };

        VKI_CONFIG.kt = 'Numerico';
        VKI_CONFIG.relative = false;

        /* CHANGE TEXT LANGUAGE */
        VKI_CONFIG.i18n = {
            '00': "Показать цифровую клавиатуру",
            '01': "Display virtual keyboard interface",
            '02': "Выбрать раскладку",
            '03': "Dead keys",
            '04': "On",
            '05': "Off",
            '06': "Скрыть клавиатуру",
            '07': "Очистить",
            '08': "Очистить ввод",
            '09': "Версия",
            '10': "Уменьшить",
            '11': "Увеличить"
        };
    })
    .run(function($templateCache) {
        //Пополнение
        $templateCache.put(
            'account/charge-balance.html',
        '<div class="bs-callout bs-callout-info" ng-if="card.account.isNewAccount && (card.group.EmitCardCost > 0 || card.group.CardDeposit > 0 || card.group.MinMoneyToEmit > 0)">' +
            '<h4>Обратите внимание</h4>' +
            '<p ng-if="card.group.EmitCardCost > 0">Стоимость регистрации карты <strong>{{card.group.EmitCardCost|currency}}</strong> (будет вычтен из суммы пополнения)</p>' +
            '<p ng-if="card.group.CardDeposit > 0">Картам группы <strong>{{card.group.Name}}</strong> требуется внести залог за карту в размере <strong>{{card.group.CardDeposit|currency}}</strong> (будет вычтен из суммы пополнения)</p>' +
            '<p ng-if="card.group.MinMoneyToEmit > 0">Минимальаня сумма пополнения <strong>{{card.group.MinMoneyToEmit|currency}}</strong></p>' +
        '</div>' +
            '<form class="form-horizontal" name="$accountChargeForm" ng-submit="updateBalance()" novalidate>' +
                '<div class="form-group" ng-class="{\'has-success\': $accountChargeForm.sum.$valid, \'has-error\': $accountChargeForm.sum.$touched && $accountChargeForm.sum.$invalid}">' +
                    '<label for="" class="col-sm-4 control-label">Сумма</label>' +
                    '<div class="col-sm-6">' +
                        '<div class="input-group">' +
                        '<input type="number" autofocus="autofocus" tabindex="0" ' +
                        'min="{{card.account.isNewAccount ? (card.group.EmitCardCost + card.group.MinMoneyToEmit + card.group.CardDeposit) : card.account.CardDeposit + card.group.MinMoneyToEmit}}" ' +
                        'class="form-control" placeholder="Сумма" name="sum" ng-model="cash.sum" ng-change="calculate()" ng-required="true" ng-virtual-keyboard>' +
                        '<div class="input-group-addon">грн.</div>' +
                        '</div>' +
                        '<span ng-if="!card.account.isNewAccount && card.group.MinMoneyToEmit > 0" class="help-block">Минимальная сумма к оплате {{card.group.MinMoneyToEmit|currency:\'грн\'}}</span>' +
                        '<span ng-if="card.account.isNewAccount && card.group.MinMoneyToEmit > 0" class="help-block">Минимальная сумма к оплате {{(card.group.EmitCardCost + card.group.MinMoneyToEmit + card.group.CardDeposit)|currency:\'грн\'}}</span>' +
                    '</div>' +
                '</div>' +
                '<div class="form-group" ng-class="{\'has-success\': $accountChargeForm.money.$valid, \'has-error\': $accountChargeForm.money.$touched && $accountChargeForm.money.$invalid}">' +
                    '<label for="" class="col-sm-4 control-label">Наличные</label>' +
                    '<div class="col-sm-6">' +
                        '<div class="input-group">' +
                        '<input type="number" min="{{cash.sum}}" class="form-control" placeholder="Наличные" name="money" ng-model="cash.money" ng-change="calculate()" ng-required="true" ng-virtual-keyboard>' +
                        '<div class="input-group-addon">грн.</div>' +
                    '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="form-group" ng-class="{\'has-success\': $accountChargeForm.money.$valid, \'has-error\': $accountChargeForm.money.$touched && $accountChargeForm.money.$invalid || $accountChargeForm.change.$invalid}">' +
                    '<div class="col-sm-offset-4 col-sm-3">' +
                        '<h3 class="text-warning">Сдача <p class="alert alert-warning">{{cash.change|currency:\'грн\'}}</p></h3>' +
                    '</div>' +
                    '<div class="col-sm-3">' +
                        '<h3 class="text-primary">Сумма на счет <p class="alert alert-success">{{cash.resultSum|currency:\'грн\'}}</p></h3>' +
                    '</div>' +
                '</div>' +
                //'<div ng-if="card.account.isNewAccount" class="form-group">' +
                //    '<div class="col-sm-4" ng-if="card.account.isNewAccount">' +
                //        '<h3 class="text-primary">Сумма на счет <p class="form-control-static">{{cash.resultSum|currency:\'грн\'}}</p></h3>' +
                //    '</div>' +
                //'</div>' +
                '<div class="form-group">' +
                    '<div class="col-sm-offset-4 col-sm-6">' +
                    '<button type="submit" class="btn btn-primary" ng-disabled="$accountChargeForm.$invalid">Оплатить!</button>' +
                    '</div>' +
                '</div>' +
            '</form>'
        )

        //Снятие
        $templateCache.put(
            'account/release-balance.html',
            '<form class="form-horizontal" name="$accountChargeForm" ng-submit="updateBalance()" novalidate>' +
                '<div class="form-group">' +
                    '<label for="" class="col-sm-4 control-label">Всего на счету</label>' +
                    '<div class="col-sm-6">' +
                        '<div class="input-group">' +
                        '<p class="form-control-static">{{cash.money|currency}}</p>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="form-group" ng-class="{\'has-success\': $accountChargeForm.sum.$valid, \'has-error\': $accountChargeForm.sum.$touched && $accountChargeForm.sum.$invalid}">' +
                    '<label for="" class="col-sm-4 control-label">Снять</label>' +
                    '<div class="col-sm-6">' +
                        '<div class="input-group">' +
                        '<input type="number" autofocus="autofocus" min="1" max="{{cash.money}}" class="form-control" placeholder="Сумма" name="sum" ng-model="cash.sum" ng-required="true" ng-virtual-keyboard>' +
                        '<div class="input-group-addon">грн.</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="form-group">' +
                    '<div class="col-sm-offset-4 col-sm-6">' +
                    '<button type="submit" class="btn btn-primary" ng-disabled="$accountChargeForm.$invalid || $accountChargeForm.$submitted">Выполнить!</button>' +
                    '</div>' +
                '</div>' +
            '</form>'
        )

        //билеты
        $templateCache.put(
            'account/tickets-exchange.html',
            '<form class="form-horizontal" name="$ticketsExchangeForm" ng-submit="submit()" novalidate>' +
            '<div class="form-group" ng-class="{\'has-success\': $ticketsExchangeForm.count.$valid, \'has-error\': $ticketsExchangeForm.count.$touched && $ticketsExchangeForm.count.$invalid}">' +
                '<label for="" class="col-sm-4 control-label">Количество</label>' +
                '<div class="col-sm-6">' +
                    '<div class="input-group">' +
                    '<input ng-if="!tickets.max" autofocus="autofocus" type="number" min="1" class="form-control" placeholder="Количество" name="count" ng-model="tickets.count" ng-required="true" ng-virtual-keyboard>' +
                    '<input ng-if="tickets.max > 0" autofocus="autofocus" type="number" min="1" max="{{tickets.max}}" class="form-control" placeholder="Количество" name="count" ng-model="tickets.count" ng-required="true" ng-virtual-keyboard>' +
                    '<div class="input-group-addon"><span class="fa fa-fw fa-ticket"></span></div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '<div class="form-group">' +
                '<div class="col-sm-offset-4 col-sm-6">' +
                '<button type="submit" class="btn btn-primary" ng-disabled="$ticketsExchangeForm.$invalid || $ticketsExchangeForm.$submitted">Выполнить!</button>' +
                '</div>' +
            '</div>' +
            '</form>'
        )

        //Замена карт
        $templateCache.put(
            'card/exchange.html',
            '<div card-swipe="success(line)">' +
            '<h3 class="blink text-center">Проведите новой картой</h3>' +
            '<div class="center-block">' +
            '<img src="assets/img/card-swiping.png" width="200px" class="img-responsive" alt="Проведите новой картой">' +
            '</div>' +
            '</div>'
        )
    })