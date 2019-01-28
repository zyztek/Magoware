function sendpush(Restangular, $uibModal, $q, notification, $state) {
    'use strict';

    return {
        restrict: 'E',
        scope: {
            selection: '=',
            type: '@',
            ngConfirmMessage: '@',
            ngConfirm: '&'
        },
        link: function(scope, element, attrs) {

            scope.icon = 'glyphicon-plus';

                if (attrs.type == 'softwareupdate') scope.label = 'Send Update Request';
                if (attrs.type == 'deletedata') scope.label = 'Send Delete Data Request';
                if (attrs.type == 'deletesharedpreferences') scope.label = 'Send Delete Shared Pref Request';

                    scope.modal = function () {
                        element.bind('click', function () {
                            var modalInstance = $uibModal.open({
                                template: '<div class="modal-header">'+
                                                '<h5 class="modal-title">Are you sure ? (' + scope.label + ')</h5>'+
                                            '</div>'+
                                                '<div class="modal-footer">'+
                                                    '<button class="btn btn-primary" type="button" ng-click="ok()">OK</button>'+
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
                                                    $q.all(scope.selection.map(e => Restangular.one('send-message-action')
                                                        .customPOST({ deviceid: e.values.id, messageaction: attrs.type })))
                                                        .then(() => notification.log(scope.selection.length + ' Successfully', { addnCls: 'humane-flatty-success' }) )
                                                        .catch(e => notification.log('A problem occurred, please try again', { addnCls: 'humane-flatty-error' }) && console.error(e) )

                                            }
                     
                                            $scope.cancel = function () {
                                                closeModal();
                                            }

                                        }]),
                                size: 'lg',
                                windowClass: 'confirm-window',
                                resolve: {
                                    confirmClick: function () {
                                        return scope.ngConfirm;
                                    },
                                    confirmMessge: function () {
                                        return scope.ngConfirmMessage;
                                    }
                                }
                            });
                        });
                    }

        },
        template: '<span ng-click="modal()"><span class="glyphicon {{ icon }}" aria-hidden="true"></span>&nbsp;{{ label }}</span>'
    };
}

sendpush.$inject = ['Restangular', '$uibModal', '$q', 'notification', '$state'];

export default sendpush;