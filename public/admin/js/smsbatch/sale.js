function sale(Restangular, $uibModal, $q, notification, $state) {
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

            if (attrs.type == 'cancel_sale') scope.label = 'Annul selected sales';

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
                                    $q.all(scope.selection.map(e => Restangular.one('annul')
                                            .customPOST({ sale_id: e.values.id,  username: e.values.user_username, login_id: e.values.login_data_id, product: e.values.combo_id})))
                                    .then(success => notification.log(success[0].data.message +'', { addnCls: 'humane-flatty-success' }) && winston.info("The response is ", success))
                                    $state.reload(); //action is performed, reload page with latest data
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

sale.$inject = ['Restangular', '$uibModal', '$q', 'notification', '$state'];

export default sale;