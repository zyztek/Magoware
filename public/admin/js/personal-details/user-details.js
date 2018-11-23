import temp from './user-details.html';

function details($stateProvider) {

    $stateProvider.state('personal', {
        parent: 'main',
        url: '/personal',
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        controller: ['Restangular', '$scope', 'notification', (Restangular, $scope, notification) => {
           
            Restangular.one('personal-details').get()
                    .then(function successCallback(response) {
                            $scope.user = {
                                username: response.username,
                                email: response.email,
                                telephone: response.telephone,
                                role: localStorage.userRole,
                                apikey: response.jwtoken
                            };

                          }, function errorCallback(response) {
                        });

                // Start Update Details

                $scope.updateDetails = function () {                  
                    Restangular.one('personal-details').put($scope.user)
                        .then(function successCallback(response) {
                          }, function errorCallback(response) {
                          })
                }

        }],
        template: temp
    });

}

details.$inject = ['$stateProvider'];

export default details;