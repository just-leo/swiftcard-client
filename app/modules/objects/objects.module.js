angular
    .module('objects', ['ui-notification', 'ngTable'])
    .run(function($templateCache) {
        $templateCache.put(
            'objects/add',
            '<form class="form-horizontal" name="$objectForm" ng-submit="save()" novalidate>' +
                '<div class="form-group" ng-class="{\'has-success\': $objectForm.Name.$valid, \'has-error\': $objectForm.Name.$touched && $objectForm.Name.$invalid}">'+
                    '<label for="" class="col-sm-3 control-label">Название</label>'+
                    '<div class="col-sm-9">'+
                        '<input type="text" class="form-control" name="Name" ng-required="true" ng-model="object.Name">'+
                    '</div>'+
                '</div>'+
                '<div class="form-group" ng-class="{\'has-success\': $objectForm.HardID.$valid, \'has-error\': $objectForm.HardID.$touched && $objectForm.HardID.$invalid}">'+
                    '<label for="description" class="col-sm-3 control-label">Адрес</label>'+
                    '<div class="col-sm-9">'+
                        '<input type="number" min="257" class="form-control" name="HardID" ng-model="object.HardID">'+
                        '<span class="help-block">Минимальное значение для адреса 257</span>' +
                    '</div>'+
                '</div>'+
                '<div class="form-group" ng-class="{\'has-success\': $objectForm.CoinPrice.$valid, \'has-error\': $objectForm.CoinPrice.$touched && $objectForm.CoinPrice.$invalid}">'+
                    '<label for="amount" class="col-sm-3 control-label">Цена импульса</label>'+
                    '<div class="col-sm-9">'+
                        '<div class="input-group">' +
                        '<input type="number" class="form-control" min="1" name="CoinPrice" ng-required="true" ng-model="object.CoinPrice">'+
                        '<div class="input-group-addon">грн.</div>' +
                        '</div>'+
                    '</div>'+
                '</div>'+
                '<div class="form-group" ng-class="{\'has-success\': $objectForm.functionPrice.$valid, \'has-error\': $objectForm.functionPrice.$touched && $objectForm.functionPrice.$invalid}">'+
                    '<label for="amount" class="col-sm-3 control-label">Число импульсов для запуска</label>'+
                    '<div class="col-sm-9">'+
                        '<div class="input-group">' +
                        '<input type="number" class="form-control" min="1" name="functionPrice" ng-required="true" ng-model="object.function.Price">'+
                        '<div class="input-group-addon"><span class="fa fa-times" aria-hidden="true"></span></div>' +
                        '</div>'+
                    '</div>'+
                '</div>'+
                '<div class="form-group">' +
                    '<label for="" class="col-sm-3 control-label">Стоимость</label>' +
                    '<div class="col-sm-9">' +
                        '<div class="input-group">' +
                        '<p class="form-control-static">{{(object.CoinPrice * object.function.Price)|currency}}</p>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                '<div class="form-group">'+
                    '<div class="col-sm-12 text-right">'+
                        '<button type="submit" ng-disabled="$objectForm.$invalid" class="btn btn-primary preview-add-button">'+
                            '<span class="fa fa-fw fa-plus"></span> {{object.id ? \'Сохранить\' : \'Добавить\'}}'+
                        '</button>'+
                    '</div>'+
                '</div>'+
            '</form>'
        )
    })