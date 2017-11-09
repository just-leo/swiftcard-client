angular
    .module('cards')
    .controller('AccountLevelListController', function AccountLevelListController($scope, accountLevelsApi, NgTableParams, Notification) {

        var tableParams = this.tableParams = new NgTableParams(
            {
                // initial page size
                count: 10,
                // initial sort order
                sorting: { Charge: "asc" },
                // initial filter
                //filter: { name: "T" }
            },
            {
                // page size buttons (right set of buttons in demo)
                counts: [10, 25, 50],
                // determines the pager buttons (left set of buttons in demo)
                paginationMaxBlocks: 8,
                paginationMinBlocks: 2,
                getData: function(table) {
                    var params = table.url()
                    params.sort = [];
                    angular.forEach(params, function(param, key){
                        if(/sorting/.test(key)) {
                            var attrName = key.replace(/sorting\[(\w+(\.\w+)*)\]/, '$1');
                            params.sort.push(param === 'desc' ? '-' + attrName : attrName)
                        }
                        if(/filter/.test(key) && param !== 'null') {
                            var attrName = key.replace(/filter\[(\w+(\.\w+)*)\]/, '$1');
                            params[attrName] = decodeURIComponent(param)
                        }
                    })
                    params.sort = params.sort.join(',');

                    return accountLevelsApi.getList(params).then(function(data) {
                        table.total(data._meta.totalCount)
                        return data
                    })
                }
            }
        )

        this.setDeleted = function(row) {
            row.Deleted = !row.Deleted
            row.save().then(
                function(resource){
                    if(resource.Deleted) {
                        Notification.warning({
                            message: 'Уровень <strong>' + resource.Name + '</strong> удален!'
                        })
                    } else {
                        Notification.success({
                            message: 'Уровень <strong>' + resource.Name + '</strong> включен!'
                        })
                    }
                },
                function(err) {
                    row.Deleted = !row.Deleted;
                    errorResponseCallback(err)
                }
            )
        }

        this.setAsStartLevel = function(row) {
            var oldValue = row.StartLevel;
            row.StartLevel = 1
            row.save().then(
                function(resource){
                    if(resource.StartLevel) {
                        Notification.warning({
                            message: 'Уровень <strong>' + resource.Name + '</strong> установлен как стартовый! Теперь вновь зарегистрированные карты будут иметь данный уровень.',
                            delay: 10000
                        })
                    } else {
                        Notification.success({
                            message: 'Уровень <strong>' + resource.Name + '</strong> не изменен!'
                        })
                    }
                    tableParams.reload()
                },
                function(err) {
                    row.StartLevel = oldValue;
                    errorResponseCallback(err)
                }
            )
        }

        var errorResponseCallback = function (errResponse) {
            //@todo show errors
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
        }

    })