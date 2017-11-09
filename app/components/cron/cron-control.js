angular
    .module('cron-control', [])
    .constant('cronOptions', {
        default_value: '* * * * *',
        enabled_minute: false,
        multiple_dom: true,
        multiple_month: true,
        multiple_mins: true,
        multiple_dow: true,
        multiple_time_hours: true,
        multiple_time_minutes: true,
        default_period: 'week',
        numeric_zero_pad: true,
        lang: 'ru',
        no_reset_button: false,
        texts: {
            ru: {
                empty: 'В любое время без перерывов',
                empty_minutes: 'любую',
                empty_time_hours: '0-24 часов',
                empty_time_minutes: 'любая минута',
                empty_day_of_week: 'каждый день недели',
                empty_day_of_month: 'каждый день месяца',
                empty_month: 'каждый месяц',
                name_minute: 'Минута',
                name_hour: 'Час',
                name_day: 'День',
                name_week: 'Неделя',
                name_month: 'Месяц',
                name_year: 'Год',
                text_period: '<b />',
                text_mins: ' в <b /> минут(у)',
                text_time: ' в <b />:<b />',
                text_dow: ' в <b />',
                text_month: ' of <b />',
                text_dom: ' в <b />',
                error1: 'Тэг %s не поддерживается !',
                error2: 'Неправильное количество элементов',
                error3: 'The jquery_element should be set into jqCron settings',
                error4: 'Не удалсь распознать выражение',
                weekdays: ['понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота', 'воскресенье'],
                months: ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь']
            }
        }
    })
    .directive('cronControl', function($parse, cronOptions) {
        return {
            restrict: 'A',
            priority: 500,
            require: '?ngModel',
            link: function ($scope, $element, $attr, ngModel) {
                var trueValueRegExp = /^(true|0|)$/i;

                cronOptions.default_value = $attr.cronControl || '* * * * *';

                if (angular.isDefined($attr['cronNoResetButton']) && trueValueRegExp.test($attr['cronNoResetButton'])) {
                    cronOptions.no_reset_button = true;
                }

                if (angular.isDefined($attr['cronDefaultPeriod'])) {
                    cronOptions.default_period = $attr['cronDefaultPeriod'];
                }

                cronOptions.bind_method = {
                    set: function($element, value) {
                        ngModel.$setViewValue(value);
                    }
                }

                var cron = $($element).jqCron(cronOptions).jqCronGetInstance();

                if (angular.isDefined($attr['cronEnabled'])) {
                    $attr.$observe('cronEnabled', function (enabled) {
                        if(trueValueRegExp.test(enabled)) {
                            cron.enable();
                        } else {
                            cron.disable();
                        }
                    })
                }

                $scope.$on('$destroy', function() {

                })
            }
        }
    })