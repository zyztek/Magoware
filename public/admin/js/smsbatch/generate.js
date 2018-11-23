function generate(Restangular, $uibModal, $q, notification, $state,$http) {
    'use strict';

    return {
        restrict: 'E',
        scope: { post: '&' },
        link: function (scope) {
            scope.generate = function () {

                function guid() {
                    return "ssssssss".replace(/s/g, s4);
                }

                function s4() {
                    return Math.floor((1 + Math.random()) * 0x10000)
                        .toString(16)
                        .substring(1);
                }

                scope.post().values.jwtoken = guid();

            };
        },
        template: '<a class="btn btn-default btn-xs" ng-click="generate()"><i class="fa fa-key fa-lg"></i>&nbsp;Generate Api Key</a>'
    };
}

generate.$inject = ['Restangular', '$uibModal', '$q', 'notification', '$state','$http'];

export default generate;