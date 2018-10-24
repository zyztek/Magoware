import moment from 'moment';
import dashboardSummaryTemplate from './resellers_dashboardSummary.html';

// var oneMonthAgo = moment().subtract(1, 'months').toDate();
var dateObj = new Date();
var year = dateObj.getFullYear();
var yearago = dateObj.getFullYear()-1;
var monthnow = ("0" + (dateObj.getMonth() + 1)).slice(-2);
var datenow = year + "-" + monthnow;
var oneMonthAgo = ("0" + (dateObj.getMonth())).slice(-2);
var dateOneMonthAgo = year + "-" + oneMonthAgo;


var has_seen_alert = false;

function resellersdashboardSummary(Restangular) {
    'use strict';

    return {
        restrict: 'E',
        scope: {},
        controller: function($scope) {
            $scope.stats = {};
            $scope.has_seen_alert = has_seen_alert;
            $scope.dismissAlert = function(){
                has_seen_alert = true;
                $scope.has_seen_alert = true;
            };

            //my sales this month
            Restangular
                .all('sales_by_month?distributorname='+localStorage.userName+'')
                .getList()
                .then(function(response) {
                    var data = response.data;
                    function findWithAttr(array, attr, value) {
                        for(var i = 0; i < array.length; i += 1) {
                            if(array[i][attr] === value) {
                                return i;
                            }
                        }
                        return -1;
                    }
                    var number = findWithAttr(data, 'saledate', datenow);
                    if (number == -1){
                        $scope.stats.this_month = 0;
                    }else{
                        $scope.stats.this_month = response.data[number].count;
                    }
                });

            //my sales last month
            Restangular
                .all('sales_by_month?distributorname='+localStorage.userName+'')
                .getList()
                .then(function(response) {
                    var data = response.data;
                    function findWithAttr(array, attr, value) {
                        for(var i = 0; i < array.length; i += 1) {
                            if(array[i][attr] === value) {
                                return i;
                            }
                        }
                        return -1;
                    }
                    var number = findWithAttr(data, 'saledate', dateOneMonthAgo);
                    if (number == -1){
                        $scope.stats.last_month = 0;
                    }else{
                        $scope.stats.last_month = response.data[number].count;
                    }
                });

            //my sales this year
            Restangular
                .all('sales_by_month?distributorname='+localStorage.userName+'&startsaledate='+year+'-01-01&endsaledate='+year+'-12-31')
                .getList()
                .then(function(response) {
                    var data = response.data;
                    var array_count = [];
                    for (var i = 0; i < data.length; i++) {
                        array_count.push(data[i].count);
                    }
                    if(array_count.length == 0){
                        $scope.stats.this_year = 0;
                    }else{
                        var sum = array_count.reduce(function(a, b) { return a + b; });
                        $scope.stats.this_year = sum;
                    }
                });

            //my sales last year
            Restangular
                .all('sales_by_month?distributorname='+localStorage.userName+'&startsaledate='+yearago+'-01-01&endsaledate='+yearago+'-12-31')
                .getList()
                .then(function(response) {
                    var data = response.data;
                    var array_count = [];
                    for (var i = 0; i < data.length; i++) {
                        array_count.push(data[i].count);
                    }
                    if(array_count.length == 0){
                        $scope.stats.last_year = 0;
                    }else{
                        var sum = array_count.reduce(function(a, b) { return a + b; });
                        $scope.stats.last_year = sum;
                    }

                });
            },
        template: dashboardSummaryTemplate
    };
}

resellersdashboardSummary.$inject = ['Restangular'];

export default resellersdashboardSummary;
