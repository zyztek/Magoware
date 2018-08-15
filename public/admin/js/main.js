'use strict'
var myApp = angular.module('myApp', ['ng-admin','ng-admin.jwt-auth', 'ngVis', 'pascalprecht.translate', 'ngCookies','dndLists']);

myApp.controller('envVariablesCtrl', ['$scope', '$http', function ($scope, $http) {
    $http.get('../api/env_settings').then(function(response) {
        $scope.version_number = "Version: "+response.data.backoffice_version;
        $scope.company_name = response.data.company_name;
        $scope.company_logo = response.data.company_logo;
    });
}]);

myApp.controller('main', function ($scope, $rootScope, $location, notification) {
    $rootScope.$on('$stateChangeSuccess', function () {
        $scope.displayBanner = $location.$$path === '/dashboard';
    });
});

//subscription export
//Takes user details
myApp.controller('InvoiceCtrl', ['$scope', '$http','$stateParams', function ($scope, $http,$stateParams) {
    //takes id from url
    var currentID = $stateParams.id;
    $http.get('../api/invoice/?login_data_id='+currentID).then(function(response) {
        $scope.users = response.data;
    });
}]);
//Footer Button
myApp.controller('buttons', ['$scope', function ($scope) {
    $scope.printInfo = function() {
        window.print();
    };

    $scope.goBack = function() {
        window.history.back();
    };
}]);

myApp.config(function ($stateProvider) {
    $stateProvider.state('invoice', {
        url: '/invoice/:id',
        templateUrl: 'subscription_export.html'
    });
});
myApp.directive('showInvoice', ['$location', function ($location) {
    return {
        restrict: 'E',
        scope: { post: '&' },
        link: function (scope) {
            scope.send = function () {
                $location.path('/invoice/' + scope.post().values.id);
            };
        },
        template: '<a class="btn btn-default" ng-click="send()"><i class="fa fa-print fa-lg"></i>&nbsp;GENERATE INVOICE</a>'
    };
}]);
//./subscription export

//EPG LOGS
myApp.directive('seeLogs', ['$location','$http', function ($location,$http) {
    return {
        restrict: 'E',
        scope: {
            fromDirectiveFn: '=method',
            post: '&'
        },
        link: function(scope, elm, attrs) {

            scope.see = function () {
                var currentlog = scope.post().values.epg_file;
                scope.filenames = currentlog;
                scope.fromDirectiveFn(scope.filenames);
            };
        },
        template: '<ma-submit-button class="pull-right" ng-click="see()" label="Submit"></ma-submit-button>'
    };
}]);


myApp.controller("logsCtrl", ['$scope','$http', function($scope,$http) {
    $scope.ctrlFn = function(arg) {
        var Indata = {'epg_file': arg};
        $http.post("../api/epgimport", Indata).then(function (response,data, status, headers, config,file) {
            // alert("success");
            $scope.records = response.data;
            $scope.records1 = [
                "File Name",
                "Saved Records",
                "Non Saved Records",
                "Error Log"
            ];
        },function (data, status, headers, config) {
            console.log("error");
        });
    };
}]);
//./EPG LOGS

//downloadInvoice

myApp.directive('downloadInvoice', ['$location','$http', function ($location,$http) {
    return {
        restrict: 'E',
        scope: { post: '&' },
        link: function (scope) {
            scope.sendsale = function () {
                var currentIDD = scope.post().values.id;
                $http.get('../api/invoice/download/'+ currentIDD, {responseType: 'blob'}).then(function(response) {
                    var data = response.data,
                        blob = new Blob([data], { type: 'application/pdf' });
                    var filename=response.headers('x-filename');
                    FileSaver.saveAs(blob, filename);
                });

            };
        },
        template: '<a class="btn btn-default btn-xs" ng-click="sendsale()"><i class="fa fa-print fa-lg"></i>&nbsp;Download</a>'
    };
}]);
//./downloadInvoice

//Drag_and_drop_package

myApp.directive('seeDrag', ['$location','$http', function ($location,$http) {
    return {
        restrict: 'E',
        scope: {
            fromDirectiveFn: '=method',
            post: '&'
        },
        link: function(scope, elm, attrs) {

            scope.see = function () {
                var package_name = scope.post().values.id;
                var package_type_id = scope.post().values.package_type_id;
                scope.fromDirectiveFn([package_name,package_type_id]);
            };
        },
        template: '<a type="buton" class="btn btn-default" ng-click="see()"><i class="fa fa-plus fa-lg"></i>&nbsp;&nbsp;ADD CHANNELS</a>'
    };
}]);


myApp.controller('dragdropctrl', ['$scope','$http','$stateParams','notification', function ($scope,$http,$stateParams,notification) {
    $scope.models = [
        {listName: "Available", items: [], dragging: false},
        {listName: "Selected", items: [], dragging: false}
    ];

    $scope.getSelectedItemsIncluding = function(list, item) {
        item.selected = true;
        return list.items.filter(function(item) { return item.selected; });
    };

    $scope.onDrop = function(list, items, index) {
        angular.forEach(items, function(item) { item.selected = false; });
        list.items = list.items.slice(0, index)
            .concat(items)
            .concat(list.items.slice(index));
        return true;
    };

    $scope.onMoved = function(list) {
        list.items = list.items.filter(function(item) { return !item.selected; });
    };

    $http.get('../api/channels').then(function(response) {

        $scope.array = response.data;
        var id_pakete = $stateParams.id;

        for(var j=0;j<$scope.array.length;j++){
            const index = $scope.array[j].packages_channels.findIndex(function (todo,index){
                return todo.package_id == id_pakete;
            })

            if(index > -1){
                var lista = $scope.models[1];
                lista.items.push({label:$scope.array[j].title,id:$scope.array[j].id,nr:$scope.array[j].channel_number});
            }else if(index <= -1){
                var lista1 = $scope.models[0];
                lista1.items.push({label:$scope.array[j].title,id:$scope.array[j].id,nr:$scope.array[j].channel_number});
            }

        }
    });

    $scope.ctrlFn = function(arg) {
        var name= arg[0];
        var id = arg[1];
        var selected = $scope.models[1].items;
        var channels_list = [];

        for (var k = 0; k < selected.length; k++) {
            channels_list.push(selected[k].id);
        }

        var data = {'package_id': name,'channel_id': channels_list};
        $http.post("../api/packagechannels", data).then(function (response,data, status, headers, config,file) {

            notification.log('Channels successfully added', { addnCls: 'humane-flatty-success' });

        },function (data, status, headers, config) {
            notification.log('Something Wrong', { addnCls: 'humane-flatty-error' });
        });
    };

}]);

//./Drag_and_drop_package

// Pagination & Sort
var apiFlavor = require('./api_flavor');
var FileSaver = require('./filesaver');
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

myApp.controller('languageCtrl', ['$translate', '$scope','$cookies', function ($translate, $scope,$cookies) {
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

    //show the selected language from dropdown list
    $scope.button = $cookies.get('cookie');
    $scope.change = function(name){
        // Find tomorrow's date.
        var expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + 364);
        $cookies.put('cookie',name,{'expires': expireDate});
        $scope.button = name;
    }
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
myApp.directive('vod', require('./smsbatch/vod'));
myApp.directive('move', require('./smsbatch/move'));
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
    admin.addEntity(nga.entity('SystemMenu'));
    admin.addEntity(nga.entity('Devices'));
    admin.addEntity(nga.entity('EpgData'));
    admin.addEntity(nga.entity('epgimport'));
    admin.addEntity(nga.entity('mychannels'));
    admin.addEntity(nga.entity('Genres'));
    admin.addEntity(nga.entity('LoginData'));
    admin.addEntity(nga.entity('Packages'));
    admin.addEntity(nga.entity('livepackages'));
    admin.addEntity(nga.entity('packagechannels'));
    admin.addEntity(nga.entity('vodPackages'));
    admin.addEntity(nga.entity('package_vod'));
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
    admin.addEntity(nga.entity('ads'));
    admin.addEntity(nga.entity('logs'));
    admin.addEntity(nga.entity('activity'));
    admin.addEntity(nga.entity('appgroup'));
    admin.addEntity(nga.entity('VodCategories'));
    admin.addEntity(nga.entity('vodstreams'));
    admin.addEntity(nga.entity('VodStreamSources'));
    admin.addEntity(nga.entity('vodsubtitles'));
    admin.addEntity(nga.entity('PaymentTransactions'));
    admin.addEntity(nga.entity('EmailTemplate'));

    //Config

    require('./emailTemplate/config')(nga, admin);
    require('./channels/config')(nga, admin);
    require('./channelStream/config')(nga, admin);
    require('./channelStreamSource/config')(nga, admin);
    require('./combo/config')(nga, admin);
    require('./comboPackages/config')(nga, admin);
    require('./customerData/config')(nga, admin);
    require('./customerGroup/config')(nga, admin);
    require('./deviceMenu/config')(nga, admin);
    require('./systemmenu/config')(nga, admin);
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
    require('./ads/config')(nga, admin);
    require('./logs/config')(nga, admin);
    require('./activit/config')(nga, admin);
    require('./appgroup/config')(nga, admin);
    require('./vod/config')(nga, admin);
    require('./vodCategory/config')(nga, admin);
    require('./vodStream/config')(nga, admin);
    require('./vodStreamSource/config')(nga, admin);
    require('./vodSubtitles/config')(nga, admin);
    require('./paymentTransactions/config')(nga, admin);


    // Menu / Header / Dashboard / Layout

    admin.dashboard(require('./dashboard/config')(nga, admin));
    admin.header(require('./header.html'));

    var menujson = require('./menuobject.js');
    // console.log("objekti menus",menujson);
    admin.menu(require('./dynamicmenu')(nga, admin,menujson));


         // admin.menu(require('./menu')(nga, admin));

    // App

    nga.configure(admin);
}]);