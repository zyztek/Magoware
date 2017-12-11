'use strict'
var myApp = angular.module('myApp', ['ng-admin','ng-admin.jwt-auth', 'ngVis', 'pascalprecht.translate', 'ngCookies']);

myApp.controller('envVariablesCtrl', ['$scope', '$http', function ($scope, $http) {
    $http.get('../api/env_settings').then(function(response) {
        $scope.version_number = "Version: "+response.data;
        console.log($scope.greeting);
    });
}]);

myApp.controller('main', function ($scope, $rootScope, $location, notification) {
    $rootScope.$on('$stateChangeSuccess', function () {
        $scope.displayBanner = $location.$$path === '/dashboard';
    });
});

// Pagination & Sort
var apiFlavor = require('./api_flavor');
myApp.config(['RestangularProvider', apiFlavor.requestInterceptor]);

myApp.controller('username', ['$scope', '$window', function($scope, $window) {
    $scope.username =  $window.localStorage.userName.toUpperCase();
}]);


var preferred_language = 'en';

myApp.controller('main', function ($scope, $rootScope, $location, notification) {
    $rootScope.$on('$stateChangeSuccess', function () {
        $scope.displayBanner = $location.$$path === '/dashboard';
    });
});

myApp.controller('languageCtrl', ['$translate', '$scope', function ($translate, $scope) {
    $scope.serve_language = function (langKey) {
        console.log("preferred language "+preferred_language);
        $translate.use(langKey);
        preferred_language = langKey;
    };
    $translate('HEADLINE').then(function (headline) {
        $scope.headline = headline;
    }, function (translationId) {
        $scope.headline = translationId;
    });
}]);

myApp.config(['$translateProvider', function ($translateProvider) {
    $translateProvider.useStaticFilesLoader({
        files: [
            {
                prefix: '../admin/languages/',
                suffix: '.json'
            }, {
                prefix: '../admin/languages/',
                suffix: '.json'
            }
        ]
    });
    $translateProvider.preferredLanguage(preferred_language);
    $translateProvider.useCookieStorage(); //remember chosen language
}]);

// Forgot Password Controller

myApp.controller('main', ['Restangular', '$scope', '$uibModal','notification', function(Restangular, $scope, $uibModal,notification) {

    $scope.modal = function () {
        var modalInstance = $uibModal.open({
            template: '<div class="modal-header">'+
            '<h5 class="modal-title">Forgot Password</h5>'+
            '</div>'+
            '<div class="container modal-body">'+
            '<form>'+
            '<div class="form-group col-xs-9">'+
            '<label for="exampleInputEmail1">Email / Username</label>'+
            '<hr>'+
            '<input type="input" class="form-control" ng-model="forgot.username" value="forgot.username" id="exampleInputEmail1" aria-describedby="emailHelp" placeholder="Enter email or username">'+
            '</div>'+
            '</form>'+
            '</div>'+
            '<div class="modal-footer">'+
            '<button class="btn btn-primary" type="button" ng-click="ok()">Submit</button>'+
            '<button class="btn btn-warning" type="button" ng-click="cancel()">Cancel</button>'+
            '</div>',
            controller: ('main', ['$scope', '$uibModalInstance', 'confirmClick', 'confirmMessge',
                function ($scope, $uibModalInstance, confirmClick, confirmMessge) {

                    $scope.confirmMessage = confirmMessge;

                    function closeModal() {

                        $uibModalInstance.dismiss('cancel');

                    }

                    $scope.ok = function () {

                        closeModal();
                        Restangular.one('auth/forgot').customPOST($scope.forgot)
                            .then(function successCallback(response) {
                                notification.log(response.message, { addnCls: 'humane-flatty-success' });

                            }, function errorCallback(response) {
                            });

                    }

                    $scope.cancel = function () {
                        closeModal();
                    }

                }]),
            size: 'lg',
            windowClass: 'confirm-window',
            resolve: {
                confirmClick: function () {
                    return $scope.ngConfirm;
                },
                confirmMessge: function () {
                    return $scope.ngConfirmMessage;
                }
            }
        });
    }

}])

// Login Controller

myApp.config(['NgAdminConfigurationProvider', 'RestangularProvider', 'ngAdminJWTAuthConfiguratorProvider', function (NgAdminConfigurationProvider, RestangularProvider, ngAdminJWTAuthConfigurator) {

    var nga = NgAdminConfigurationProvider;

    if (location.protocol == 'http:') {

        ngAdminJWTAuthConfigurator.setJWTAuthURL('http://' + location.host + '/api/auth/login');

    } else {

        ngAdminJWTAuthConfigurator.setJWTAuthURL('https://' + location.host + '/api/auth/login');

    }

    ngAdminJWTAuthConfigurator.setCustomLoginTemplate('customLoginTemplate.html');

    ngAdminJWTAuthConfigurator.setCustomAuthHeader({
        name: 'Authorization',
        template: '{{token}}'
    });


}]);

myApp.run(['Restangular', '$location', 'notification', function(Restangular, $location, notification) {
    Restangular.setErrorInterceptor(function(response, deferred, responseHandler) {
        if(response.status > 200) {

            deferred.reject("Server not responding to [some address]. It could be down, or this could be the wrong url.");
            notification.log('Error: ' + ' ( ' + response.data.message + ' )', { addnCls: 'humane-flatty-error' })

            return false;

        }

    });
}]);

// Dashboard Directives
myApp.directive('dashboardSummary', require('./dashboard/dashboardSummary'));
myApp.directive('graph', require('./dashboard/graphs'));
myApp.directive('sendpush', require('./smsbatch/sendpush'));
myApp.directive('sale', require('./smsbatch/sale'));
myApp.directive('approveReview', require('./groups/approveReview'));

//myApp.directive('roles', require('./grouprights/radioRoles'));


// personal config
myApp.config(['$stateProvider', require('./personal-details/user-details')]);
myApp.config(['$stateProvider', require('./change-pass/change-password')]);
myApp.config(['$stateProvider', require('./epgData/epgchart')]);


myApp.config(['NgAdminConfigurationProvider', function (nga) {

    // App Create

    if (location.protocol == 'http:') {

        var admin = nga.application('MAGOWARE').baseApiUrl('http://' + location.host + '/api/');

    } else {

        var admin = nga.application('MAGOWARE').baseApiUrl('https://' + location.host + '/api/');

    }

    // Table Configuration

    admin.addEntity(nga.entity('Channels'));
    admin.addEntity(nga.entity('ChannelStreams'));
    admin.addEntity(nga.entity('ChannelStreamSources'));
    admin.addEntity(nga.entity('Combos'));
    admin.addEntity(nga.entity('comboPackages'));
    admin.addEntity(nga.entity('CustomerData'));
    admin.addEntity(nga.entity('CustomerGroups'));
    admin.addEntity(nga.entity('DeviceMenus'));
    admin.addEntity(nga.entity('Devices'));
    admin.addEntity(nga.entity('EpgData'));
    admin.addEntity(nga.entity('epgimport'));
    admin.addEntity(nga.entity('mychannels'));
    admin.addEntity(nga.entity('Genres'));
    admin.addEntity(nga.entity('LoginData'));
    admin.addEntity(nga.entity('livepackages'));
    admin.addEntity(nga.entity('Packages'));
    admin.addEntity(nga.entity('vodPackages'));
    admin.addEntity(nga.entity('packagechannels'));
    admin.addEntity(nga.entity('packagetypes'));
    admin.addEntity(nga.entity('Salesreports'));
    admin.addEntity(nga.entity('sales_by_product'));
    admin.addEntity(nga.entity('sales_by_date'));
    admin.addEntity(nga.entity('sales_by_month'));
    admin.addEntity(nga.entity('sales_monthly_expiration'));
    admin.addEntity(nga.entity('sales_by_expiration'));
    admin.addEntity(nga.entity('Settings'));
    admin.addEntity(nga.entity('Subscriptions'));
    admin.addEntity(nga.entity('Users'));
    admin.addEntity(nga.entity('Groups'));
    admin.addEntity(nga.entity('Grouprights'));
    admin.addEntity(nga.entity('Vods'));
    admin.addEntity(nga.entity('appmanagement'));
    admin.addEntity(nga.entity('messages'));
    admin.addEntity(nga.entity('commands'));
    admin.addEntity(nga.entity('logs'));
    admin.addEntity(nga.entity('activity'));
    admin.addEntity(nga.entity('appgroup'));
    admin.addEntity(nga.entity('VodCategories'));
    admin.addEntity(nga.entity('vodstreams'));
    admin.addEntity(nga.entity('VodStreamSources'));
    admin.addEntity(nga.entity('vodsubtitles'));

    //Config

    require('./channels/config')(nga, admin);
    require('./channelStream/config')(nga, admin);
    require('./channelStreamSource/config')(nga, admin);
    require('./combo/config')(nga, admin);
    require('./comboPackages/config')(nga, admin);
    require('./customerData/config')(nga, admin);
    require('./customerGroup/config')(nga, admin);
    require('./deviceMenu/config')(nga, admin);
    require('./devices/config')(nga, admin);
    require('./epgData/config')(nga, admin);
    require('./epgimport/config')(nga, admin);
    require('./genre/config')(nga, admin);
    require('./loginData/config')(nga, admin);
    require('./livepackages/config')(nga, admin);
    require('./package/config')(nga, admin);
    require('./vod_package/config')(nga, admin);
    require('./my_channel/config')(nga, admin);
    require('./packagesChannels/config')(nga, admin);
    require('./packageType/config')(nga, admin);
    require('./salesreport/config')(nga, admin);
    require('./sales_by_product/config')(nga, admin);
    require('./sales_by_date/config')(nga, admin);
    require('./sales_by_month/config')(nga, admin);
    require('./sales_monthly_expiration/config')(nga, admin);
    require('./sales_by_expiration/config')(nga, admin);
    require('./settings/config')(nga, admin);
    require('./subscription/config')(nga, admin);
    require('./user/config')(nga, admin);
    require('./groups/config')(nga, admin);
    require('./grouprights/config')(nga, admin);
    require('./app_management/config')(nga, admin);
    require('./message/config')(nga, admin);
    require('./commands/config')(nga, admin);
    require('./logs/config')(nga, admin);
    require('./activit/config')(nga, admin);
    require('./appgroup/config')(nga, admin);
    require('./vod/config')(nga, admin);
    require('./vodCategory/config')(nga, admin);
    require('./vodStream/config')(nga, admin);
    require('./vodStreamSource/config')(nga, admin);
    require('./vodSubtitles/config')(nga, admin);

    // Menu / Header / Dashboard / Layout

    admin.dashboard(require('./dashboard/config')(nga, admin));
    admin.header(require('./header.html'));
    admin.menu(require('./menu')(nga, admin));

    // App

    nga.configure(admin);
}]);