import customerRgst from './customerRgst.html';
import segments from './customerData';

export default function ($stateProvider) {
    $stateProvider.state('customerRegistration', {
        parent: 'main',
        url: '/customerRegistration',
        params: { },
        controller: ['$scope', ($scope) => {
           $scope.segments = segments.values;
        }],
        template: customerRgst
    });
};