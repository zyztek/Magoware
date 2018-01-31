import Template from './change-password.html';

export default function ($stateProvider) {
    $stateProvider.state('change-password', {
        parent: 'main',
        url: '/change-password',
        params: {},

        controller: ['Restangular', '$scope', 'notification', (Restangular, $scope, notification) => {

            $scope.pwdata = {
            currentPassword: '',
            newPassword: '',
            verifyPassword: ''
        };

    $scope.createPost = function () {
        Restangular.one('user/change-password').customPOST($scope.pwdata)
            .then(function successCallback(response) {
                notification.log(response.message, { addnCls: 'humane-flatty-success' });
            },function errorCallback(response) {
                notification.log(response.data.message, { addnCls: 'humane-flatty-error' });
            });
    }
}],

    template: Template
});
};