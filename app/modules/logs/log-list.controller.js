angular
    .module('logs')
    .controller('LogListController', function LogListController($scope, NgTableParams, logsApi){

        this.tableParams = new NgTableParams(
            {
                // initial page size
                count: 50,
                // initial sort order
                sorting: { log_time: "desc" },
                // initial filter
                //filter: { name: "T" }
            },
            {
                // page size buttons (right set of buttons in demo)
                counts: [10, 25, 50, 100, 250],
                // determines the pager buttons (left set of buttons in demo)
                paginationMaxBlocks: 10,
                paginationMinBlocks: 2,
                getData: function(table) {
                    var params = table.url()
                    params.sort = [];
                    angular.forEach(params, function(param, key){
                        if(/sorting/.test(key)) {
                            var attrName = key.replace(/sorting\[(\w+[.-]?\w+)\]/, '$1');
                            params.sort.push(param === 'desc' ? '-' + attrName : attrName)
                        }
                        if(/filter/.test(key) && param !== 'null') {
                            var attrName = key.replace(/filter\[(\w+(\.\w+)*)\]/, '$1');
                            params[attrName] = decodeURIComponent(param)
                        }
                    })
                    params.sort = params.sort.join(',');

                    return logsApi.getList(params).then(function(data) {
                        table.total(data._meta.totalCount)
                        return data
                    })
                }
            }
        )

        this.logLevels = [
            {id: '', title: 'Все', toString: function(){return this.id}},
            {id: 1, title: 'Ошибки', toString: function(){return this.id}},
            {id: 2, title: 'Предупреждения', toString: function(){return this.id}},
            {id: 4, title: 'Информационные', toString: function(){return this.id}},
            {id: 8, title: 'Трейс', toString: function(){return this.id}},
            {id: 40, title: 'Профайл', toString: function(){return this.id}},
            {id: 50, title: 'Профайл начало', toString: function(){return this.id}},
            {id: 60, title: 'Профайл конец', toString: function(){return this.id}}
        ]
    })