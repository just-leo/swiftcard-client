angular
    .module('report', ['ui-notification', 'angularMoment', 'mgcrea.ngStrap.datepicker'])
    .controller('ReportController', function CashController($scope, Notification, Api, cfpLoadingBar, $window, $http) {

        var self = this;

        var dateFrom = new Date();
        dateFrom.setMonth(dateFrom.getMonth() - 1)

        $scope.model = {
            dateFrom: dateFrom.getTime(),
            dateUntil: Date.now()
        }

        $scope.inProgress = false;

        this.get = function() {
            $scope.inProgress = true
            cfpLoadingBar.start()
            var route = Api.getRestangularUrl()
            $http
                .post(route, $scope.model, {responseType: 'blob', withCredentials: true})
                .success(function(response) {
                    $window.saveAs(response, 'report.xlsx')
                    cfpLoadingBar.complete()
                    $scope.inProgress = false
                })
                .error(function(errResponse) {
                    cfpLoadingBar.complete()
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
                            title: 'Ошибка ' + errResponse.status,
                            message: errResponse.data ? errResponse.data.message : errResponse.statusText
                        })
                    }
                    $scope.inProgress = false
                })
        }

    })
    .factory('FileDownloader', function($window, $log, $http, $q){
        if ($window.saveAs === undefined) {
            $log.warn('svgDownload Error: FileSaver not loaded.  See installation instructions.');
        }
        return {
            fromUrl: function (url, params) {
                if (params) {
                    params._ = new Date().getTime();
                } else {
                    params = { _: new Date().getTime() }
                }
                return $q(function(resolve, reject) {
                    $http.get(url, {
                        params: params,
                        responseType: 'blob'
                        //mimeType:'text/plain; charset=x-user-defined'
                    }).success(function(blob, status, headers, config) {
                        //var responseHeaders = headers(),
                        //blob = new $window.Blob([data], {type: responseHeaders['content-type']});
                        resolve(blob)
                    }).error(function (data, status, headers, config) {
                        reject({ data:data, status:status, headers: headers() });
                    });
                })
            },
            save: function(blob, filename) {
                $window.saveAs(blob, filename)
            }
        }
    })