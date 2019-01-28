import temp from './geoip.html';

function details($stateProvider) {

    $stateProvider.state('geoip', {
        parent: 'main',
        url: '/geoip',
        headers: { "Content-Type": "application/json;charset=UTF-8" },
        controller: ['$http', '$scope', 'notification', function($http, $scope, notification) {

                $http.post('../apiv2/geoip/status').then(function successCallback(response) {

                    if(response.data.status === false){
                        document.getElementById('status_false').style.display = "block";
                        document.getElementById('status_false').innerHTML = response.data.message;
                    }else {
                        document.getElementById('status_true').style.display = "block";
                        document.getElementById('status_true').innerHTML = response.data.message;
                    }

                }, function errorCallback(response) {
                    document.getElementById('status_false').style.display = "none";
                    document.getElementById('status_true').style.display = "none";
                    notification.log(response.statusText, { addnCls: 'humane-flatty-error' });
                });


                $scope.updateurl = function () {
                    var ui_url = document.getElementById('send_url').value;

                    var data = {'url': ui_url};
                    $http.post('../apiv2/geoip/update', data).then(function successCallback(response) {

                        if(response.data.status === true){
                            document.getElementById('status_false').style.display = "none";
                            document.getElementById('status_true').style.display = "block";
                            document.getElementById('status_true').innerHTML = 'Geoip is active';
                            notification.log(response.data.message, { addnCls: 'humane-flatty-success' });
                        }else {
                            document.getElementById('status_true').style.display = "none";
                            document.getElementById('status_false').style.display = "block";
                            document.getElementById('status_false').innerHTML = "Geoip is not active because Database binary file not found";
                            notification.log(response.data.message, { addnCls: 'humane-flatty-error' });
                        }

                    }, function errorCallback(response) {
                        document.getElementById('status_false').style.display = "none";
                        document.getElementById('status_true').style.display = "none";
                        notification.log(response.statusText, { addnCls: 'humane-flatty-error' });
                    });
                }

        }],
        template: temp
    });
}

details.$inject = ['$stateProvider'];

export default details;