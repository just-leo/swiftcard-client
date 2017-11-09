angular
    .module('finances')
    .controller('AccountFinanceListController', function AccountFinanceListController($scope, $rootScope, NgTableParams, financesApi, card, Notification){

        var tableParams = this.tableParams = new NgTableParams(
            {
                // initial page size
                count: 5,
                // initial sort order
                sorting: { EventTime: "desc" },
                // initial filter
                //filter: { name: "T" }
            },
            {
                // page size buttons (right set of buttons in demo)
                counts: [5, 20, 50],
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
                            params[key] = decodeURIComponent(param)
                        }
                    })
                    params.sort = params.sort.join(',');
                    params.ContractorID = card.ID;

                    return financesApi.getList(params).then(function(data) {
                        table.total(data._meta.totalCount)
                        //table.count(data._meta.perPage)
                        return data
                    })
                }
            }
        )

        $scope.$on('account.finances:reload', function(e){
            tableParams.reload()
        })

        function reloadAccount() {
            $rootScope.$broadcast('account.account:reload', card)
        }

        this.cancel = function(row) {
            var oldCancelAccountID = row.CancelAccountID;
            row.one('cancel').post().then(
                function(result){
                    Notification.success({
                        message: 'Операция отменена!'
                    })
                    tableParams.reload()
                    reloadAccount()
                },
                function(err) {
                    row.CancelAccountID = oldCancelAccountID;
                    Notification.warning({
                        message: 'Операция не отменена!'
                    })
                    errorResponseCallback(err)
                }
            )
        }

        this.apply = function(row) {
            row.one('apply').post().then(
                function(result){
                    Notification.success({
                        message: 'Операция применена!'
                    })
                    tableParams.reload()
                    reloadAccount()
                },
                function(err) {
                    Notification.warning({
                        message: 'Операция не была применена!'
                    })
                    errorResponseCallback(err)
                }
            )
        }

        function errorResponseCallback(errResponse) {
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