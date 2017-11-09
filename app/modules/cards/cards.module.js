angular
    .module('cards', ['ui-notification', 'ngTable', 'angularMoment', 'mgcrea.ngStrap.button'])
    .run(['$templateCache', function($templateCahe) {
        $templateCahe.put('cards/tabs.html',
            '<ul class="nav nav-tabs">' +
            '<li role="presentation" ui-sref-active-eq="active"><a ui-sref="root.aside.main.cards"><span class="fa fa-fw fa-user text-muted"></span> Карты</a></li>' +
            '<li role="presentation" ui-sref-active-eq="active"><a ui-sref="root.aside.main.card-groups"><span class="fa fa-fw fa-users text-muted"></span> Группы</a></li>' +
            '<li role="presentation" ui-sref-active-eq="active"><a ui-sref="root.aside.main.account-levels"><span class="fa fa-fw fa-line-chart text-muted"></span> Уровни</a></li>' +
            '</ul>'
        )
    }])