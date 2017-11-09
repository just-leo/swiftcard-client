angular
    .module('objects')
    .controller('ObjectListController', function ObjectListController($scope, objectsApi, NgTableParams, $modal, Notification) {

        $scope.tableParams = new NgTableParams(
            {
                // initial page size
                count: 10,
                // initial sort order
                sorting: { created_at: "desc" },
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
                    return objectsApi.getList(params).then(function(data) {
                        table.total(data._meta.totalCount)
                        //table.count(data._meta.perPage)

                        // ensure that the current page size is one of the options
                        //if (newSizes.indexOf(self.tableParams.count()) === -1) {
                        //    newSizes.push(self.tableParams.count());
                        //    newSizes.sort();
                        //}
                        //self.tableParams.settings({ counts: newSizes});

                        return data
                    })
                }
            }
        )

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

        var formController = function formController($scope, objectsApi, object) {
            $scope.hideFooter = true;

            $scope.object = object

            $scope.save = function() {
                if(!$scope.$objectForm || $scope.$objectForm.$invalid) return;

                if($scope.$objectForm.$pristine) {
                    $scope.$hide()
                    return
                }

                if($scope.object.id) {
                    $scope.object.save().then(
                        function(obj){
                            Notification.success({
                                message: 'Объект <strong>' + obj.Name + '</strong> успешно обновлен!'
                            })
                            $scope.$hide()
                        },
                        function(err) {
                            $scope.$objectForm.$submitted = false
                            errorResponseCallback(err)
                        }
                    )
                } else {
                    objectsApi.post($scope.object).then(
                        function (object) {
                            $scope.$hide()
                        }, function(err) {
                            //$scope.$objectForm.$setSubmitted(false)
                            $scope.$objectForm.$submitted = false
                            errorResponseCallback(err)
                        })
                }
            }
        }

        $scope.addNew = function() {
            $modal({
                title: 'Новый объект',
                show: true,
                size: 'lg',
                backdrop: 'static',
                resolve: {
                    objectsApi: function() {
                        return objectsApi
                    },
                    object: function() {
                        return {
                            Name: '',
                            HardID: 0,
                            CoinPrice: 0,
                            function: {
                                Price: 0
                            }
                        }
                    }
                },
                contentTemplate: 'objects/add',
                controller: formController,
                onHide: function($modal){
                    $modal.destroy()
                    //refresh
                    $scope.tableParams.reload()
                }
            })
        }

        $scope.edit = function(object) {
            $modal({
                title: 'Редактирование данных объекта',
                show: true,
                size: 'lg',
                backdrop: 'static',
                resolve: {
                    objectsApi: function() {
                        return objectsApi
                    },
                    object: function() {
                        return object
                    }
                },
                contentTemplate: 'objects/add',
                controller: formController,
                onHide: function($modal){
                    $modal.destroy()
                    //refresh
                    $scope.tableParams.reload()
                }
            })
        }

        $scope.disableObject = function(object){
            object.Disabled = !object.Disabled;
            object.save().then(
                function(obj){
                    if(obj.Disabled) {
                        Notification.warning({
                            message: 'Объект <strong>' + obj.Name + '</strong> отключен!'
                        })
                    } else {
                        Notification.success({
                            message: 'Объект <strong>' + obj.Name + '</strong> включен!'
                        })
                    }
                },
                function(err) {
                    object.Disabled = !object.Disabled;
                    errorResponseCallback(err)
                }
            )
        }
    })