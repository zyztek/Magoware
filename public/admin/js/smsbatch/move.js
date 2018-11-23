function move(Restangular, $uibModal, $q, notification, $state,$http) {
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

            scope.icon = 'glyphicon-list';
            if (attrs.type == 'move_to_package') scope.button = 'Move to Package';
            var vods_array = [];

            $http.get('../api/vodpackages?package_type_id=3&package_type_id=4').then(function(response) {
                var data = response.data;
                for(var i=0;i<data.length;i++){
                    vods_array.push({name:data[i].package_name,id:data[i].id})
                }
            });

            scope.list_of_vods = vods_array;
            var newarray = [];

            scope.moveto = function () {
                var array_of_selection_vod = scope.selection;

                scope.change = function(name,id){
                    scope.button = name;
                    var id_of_selected_package = id;

                    for(var j=0;j<array_of_selection_vod.length;j++){
                        newarray.push({package_id:id_of_selected_package,vod_id:array_of_selection_vod[j].values.id})
                    }

                    if(newarray.length === 0) {
                        notification.log('Sorry, you have not selected any Vod item.', { addnCls: 'humane-flatty-error' });
                    } else {
                        $http.post("../api/package_vod", newarray).then(function (response,data, status, headers, config,file) {
                            notification.log('Vod successfully added', { addnCls: 'humane-flatty-success' });
                            window.location.replace("#/vodPackages/edit/"+id_of_selected_package);
                        },function (data, status, headers, config) {
                            notification.log('Something Wrong', { addnCls: 'humane-flatty-error' });
                        }).on(error, function(error){
                            winston.error("The error during post request is ")
                        });
                    }
                };
            }

        },
        template: `<div class="btn-group" uib-dropdown is-open="status.isopen"> 
                        <button id="single-button" type="button" class="btn btn-default" uib-dropdown-toggle ng-disabled="disabled">
                           <span class="glyphicon {{icon}}"></span> {{button}} <span class="caret"></span>
                        </button>
                          <ul class="dropdown-menu" uib-dropdown-menu role="menu" aria-labelledby="single-button">
                            <li role="menuitem" ng-click="change(choice.name,choice.id)"  ng-repeat="choice in list_of_vods">
                                <p id="paragraph_vod" ng-click="moveto()">{{choice.name}}</p>
                            </li>
                          </ul>
                    </div>`
    };
}

move.$inject = ['Restangular', '$uibModal', '$q', 'notification', '$state','$http'];

export default move;