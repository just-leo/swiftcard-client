angular
    .module('cards')
    .controller('CardListController', function CardListController($scope, cardsApi, NgTableParams, cardGroupsList, accountLevelsList) {

        this.cardGroups = _.map(cardGroupsList, function(group){
            group.title = group.Name
            return group
        })

        this.accountLevels = _.map(accountLevelsList, function(level){
            level.title = level.Name
            return level
        })

        var tableParams = this.tableParams = new NgTableParams(
            {
                // initial page size
                count: 25,
                // initial sort order
                //sorting: { name: "asc" },
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
                            params[attrName] = param
                        }
                    })
                    params.sort = params.sort.join(',');
                    return cardsApi.getList(params).then(function(data) {
                        table.total(data._meta.totalCount)
                        //table.count(data._meta.perPage)
                        return data
                    })
                }
            }
        )
    })