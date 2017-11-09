angular
    .module('cards')
    .controller('CardGroupListController', function CardGroupListController($scope, cardGroupsApi, NgTableParams, Notification, $modal) {
        
        var self = this;
        
        var tableParams = this.tableParams = new NgTableParams(
            {
                // initial page size
                count: 10,
                // initial sort order
                sorting: { IsService: "desc" },
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

                    return cardGroupsApi.getList(params).then(function(data) {
                        table.total(data._meta.totalCount)
                        return data
                    })
                }
            }
        )

        this.edit = function(group) {
            $modal({
                title: 'Редактирование группы ' + group.Name,
                show: true,
                size: 'lg',
                backdrop: 'static',
                resolve: {
                    Api: function() {
                        return cardGroupsApi
                    },
                    group: function() {
                        return group
                    }
                },
                contentTemplate: 'modules/cards/card-group.form.html',
                controller: formController,
                onHide: function($modal){
                    $modal.destroy()
                    //refresh
                    tableParams.reload()
                }
            })
        }

        this.addNew = function() {
            $modal({
                title: 'Добавление группы ',
                show: true,
                size: 'lg',
                backdrop: 'static',
                resolve: {
                    Api: function() {
                        return cardGroupsApi
                    },
                    group: function() {
                        return {
                            Name: '',
                            Description: '',
                            IsService: 0,
                            MinMoneyToEmit: '',
                            EmitCardCost: '',
                            CardDeposit: '',
                            CardRepairCost: ''
                        }
                    }
                },
                contentTemplate: 'modules/cards/card-group.form.html',
                controller: formController,
                onHide: function($modal){
                    $modal.destroy()
                    //refresh
                    tableParams.reload()
                }
            })
        }

        this.setAsDefaultGroup = function(group) {
            var oldValue = group.IsDefaultForNewCard;
            group.IsDefaultForNewCard = 1
            group.save().then(
                function(resource){
                    if(resource.IsDefaultForNewCard) {
                        Notification.warning({
                            message: 'Группа <strong>' + resource.Name + '</strong> установлена "по-умолчанию"! Теперь вновь зарегистрированные карты будут автоматически регистрироваться с данной группой.',
                            delay: 10000
                        })
                    } else {
                        Notification.success({
                            message: 'Группа <strong>' + resource.Name + '</strong> не изменена!'
                        })
                    }
                    tableParams.reload()
                },
                function(err) {
                    group.IsDefaultForNewCard = oldValue;
                    errorResponseCallback(err)
                }
            )
        }

        this.delete = function(group) {
            group.Deleted = !group.Deleted
            group.save().then(
                function(resource){
                    if(resource.Deleted) {
                        Notification.warning({
                            message: 'Группа <strong>' + resource.Name + '</strong> удалена!'
                        })
                    } else {
                        Notification.success({
                            message: 'Группа <strong>' + resource.Name + '</strong> включена!'
                        })
                    }
                },
                function(err) {
                    group.Deleted = !group.Deleted;
                    errorResponseCallback(err)
                }
            )
        }

        function formController($scope, Api, group) {
            $scope.hideFooter = true;

            $scope.group = group

            $scope.save = function() {
                if(!$scope.$groupForm || $scope.$groupForm.$invalid) return;

                if($scope.$groupForm.$pristine) {
                    $scope.$hide()
                    return;
                }

                if($scope.group.id) {
                    $scope.group.save().then(
                        function(obj){
                            Notification.success({
                                message: 'Группа <strong>' + obj.Name + '</strong> успешно обновлена!'
                            })
                            $scope.$hide()
                        },
                        function(err) {
                            $scope.$groupForm.$submitted = false
                            errorResponseCallback(err)
                        }
                    )
                } else {
                    Api.post($scope.group).then(
                        function (group) {
                            $scope.$hide()
                        }, function(err) {
                            //$scope.$groupForm.$setSubmitted(false)
                            $scope.$groupForm.$submitted = false
                            errorResponseCallback(err)
                        })
                }
            }
        }
        
        function errorResponseCallback(errResponse) {
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