angular
    .module('actions')
    .controller('ActionListController', function ActionListController($scope, actionsApi, actionClasses, objectApi, NgTableParams, $modal, Notification, $sce) {

        $scope.actionClasses = actionClasses;

        $scope.trustAsHtml = function(value) {
            return $sce.trustAsHtml(value ? '<i class="fa fa-2x fa-bolt" aria-hidden="true"></i>' : '<i class="fa fa-2x fa-minus" aria-hidden="true"></i>');
        }

        $scope.tableParams = new NgTableParams(
            {
                // initial page size
                count: 10,
                // initial sort order
                sorting: { EventTime: "desc" },
                // initial filter
                //filter: { name: "T" }
            },
            {
                // page size buttons (right set of buttons in demo)
                counts: [10, 20, 50],
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

                    return actionsApi.getList(params).then(function(data) {
                        table.total(data._meta.totalCount)
                        //table.count(data._meta.perPage)
                        return data
                    })
                }
            }
        )

        $scope.addNew = function(className) {
            $modal({
                title: className.name,
                show: true,
                size: 'lg',
                resolve: {
                    actionsApi: function() {
                        return actionsApi
                    },
                    discountClass: function() {
                        return className
                    },
                    objectsApi: function() {
                        return objectApi
                    }
                },
                contentTemplate: 'modules/actions/discount-discount.html',
                controller: function($scope, actionsApi, discountClass, objectsApi) {

                    $scope.trustAsHtml = function(value) {
                        return $sce.trustAsHtml(value);
                    }

                    $scope.action = {
                        name: '',
                        dateFrom: Date.now(),
                        dateTo: Date.now(),
                        schedule: '* * * * *',
                        withHighPriority: false,
                        className: discountClass.className,
                        isMultiple: discountClass.isMultiple,
                        discount: {
                            objects: discountClass.objects
                        },
                        discounts: []
                    }

                    $scope.objectList = objectsApi.getList().$object;

                    $scope.discountClass = discountClass;

                    angular.forEach(discountClass.discounts, function(discountAttributes) {
                        var result = {};
                        discountAttributes.forEach(function(attr){
                            result[attr.name] = attr.value
                        })
                        $scope.action.discounts.push(result)
                    })

                    angular.forEach(discountClass.discount, function(attr){
                        $scope.action.discount[attr.name] = attr.value
                    })

                    $scope.hideFooter = true;

                    $scope.save = function() {
                        if(!$scope.$actionForm || $scope.$actionForm.$invalid) return;

                        if(!$scope.action.id) {
                            actionsApi.post($scope.action).then(function (action) {
                                Notification.success({
                                    message: 'Акция <strong>' + action.name + '</strong> добавлена!'
                                })
                                $scope.$hide()
                            }, function (errResponse) {
                                $scope.$actionForm.$setSubmitted(false)
                                errorResponseCallback(errResponse)
                            })
                        }
                    }
                },
                onHide: function($modal){
                    $modal.destroy()
                    //refresh
                    $scope.tableParams.reload()
                }
            })
        }

        $scope.disable = function(action){
            action.disabled = !action.disabled;
            action.save().then(
                function(action){
                    if(action.disabled) {
                        Notification.warning({
                            message: 'Акция <strong>' + action.name + '</strong> отключена!'
                        })
                    } else {
                        Notification.success({
                            message: 'Акция <strong>' + action.name + '</strong> включена!'
                        })
                    }
                },
                function(errResponse) {
                    action.disabled = !action.disabled;
                    errorResponseCallback(errResponse)
                }
            )
        }

        $scope.delete = function(action){
            action.deleted = !action.deleted;
            action.save().then(
                function(action){
                    if(action.deleted) {
                        Notification.warning({
                            message: 'Акция <strong>' + action.name + '</strong> удалена!'
                        })
                    } else {
                        Notification.success({
                            message: 'Акция <strong>' + action.name + '</strong> восстановлена!'
                        })
                    }
                },
                function(errResponse) {
                    action.deleted = !action.deleted;
                    errorResponseCallback(errResponse)
                }
            )
        }

        $scope.edit = function(action) {
            $modal({
                title: 'Редактирование: ' + action.name,
                show: true,
                size: 'lg',
                resolve: {
                    actionsApi: function() {
                        return actionsApi
                    },
                    action: function() {
                        return action
                    },
                    classes: function() {
                        return actionClasses
                    },
                    objectsApi: function() {
                        return objectApi
                    }
                },
                contentTemplate: 'modules/actions/discount-discount.html',
                controller: function($scope, actionsApi, action, classes, objectsApi) {
                    var settings = action.discount;
                    $scope.action = action
                    $scope.action.settings = settings//object
                    $scope.discountClass = null
                    $scope.objectList = objectsApi.getList().$object
                    for(var c = 0, l = classes.length; c < l; c++) {
                        var className = classes[c]
                        if(className.fullClass === settings.class) {
                            $scope.discountClass = className
                            break
                        }
                    }

                    //Implemented on server side
                    if(action.isMultiple && angular.isArray(settings.attributes)) {
                        //$scope.action.discounts = settings.attributes
                    } else {
                        //$scope.action.discount = settings
                    }

                    $scope.hideFooter = true;

                    $scope.save = function() {
                        if(!$scope.$actionForm || $scope.$actionForm.$invalid) return;

                        if(action.isMultiple && angular.isArray($scope.action.discounts)) {
                            $scope.action.settings.attributes = $scope.action.discounts
                            $scope.action.settings = angular.toJson($scope.action.settings)
                        } else {
                            $scope.action.settings = angular.toJson(angular.extend($scope.action.settings, $scope.action.discount))
                        }

                        $scope.action.save().then(function (newAction) {
                            Notification.success({
                                message: 'Акция <strong>' + newAction.name + '</strong> обновлена!'
                            })
                            angular.extend($scope.action, newAction.plain())
                            $scope.$hide()
                        }, function (errResponse) {
                            $scope.action.settings = angular.fromJson($scope.action.settings)
                            $scope.$actionForm.$setSubmitted(false)
                            errorResponseCallback(errResponse)
                        })
                    }
                },
                onHide: function($modal){
                    $modal.destroy()
                    //refresh
                    $scope.tableParams.reload()
                }
            })
        }

        var errorResponseCallback = function (errResponse) {
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