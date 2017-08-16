import moment from 'moment';
import dashboardSummaryTemplate from './dashboardSummary.html';

var oneMonthAgo = moment().subtract(1, 'months').toDate();

var has_seen_alert = false;

function dashboardSummary(Restangular) {
    'use strict';

    return {
        restrict: 'E',
        scope: {},
        controller: function($scope) {
            $scope.stats = {};
            $scope.has_seen_alert = has_seen_alert;
            $scope.dismissAlert = () => {
                has_seen_alert = true;
                $scope.has_seen_alert = true;
            };
            Restangular
                .all('loginData')
                .getList({_page: 1, _perPage: 10})
                .then(logindata => {
                    $scope.stats.logindata = logindata.headers('x-total-count');
                });

            Restangular
                .all('channels')
                .getList({_page: 1, _perPage: 10})
                .then(channels => {
                        $scope.stats.channels = channels.headers('x-total-count');
                });
            Restangular
                .all('vods')
                .getList({_page: 1, _perPage: 10})
                .then(vods => {
                     $scope.stats.vods = vods.headers('x-total-count'); //reviews.data.999
                 });
            Restangular
                .all('devices')
                .getList({_page: 1, _perPage: 10})
                .then(devices => {
                     $scope.stats.devices = devices.headers('x-total-count'); //reviews.data.999
                 });
        },
        template: dashboardSummaryTemplate
    };
}

dashboardSummary.$inject = ['Restangular'];

export default dashboardSummary;
