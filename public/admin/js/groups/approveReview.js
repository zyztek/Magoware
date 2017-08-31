//todo: change function name
function approveReview(Restangular, $state, notification) {
    'use strict';

    return {
        restrict: 'E',
        scope: {
            review: "&",
            size: "@",
        },
        link: function(scope, element, attrs) {
                //console.log(scope.$parent.datastore._entries.Groups_22["0"]._identifierValue);
            //console.log(scope);
            scope.review = scope.review();
            scope.type = attrs.type;
            scope.approve = function(method,value) {

                if(!value) value = true
                else value = !value;

                var theobj = {};
                    //todo: user better method
                    theobj.group_id = scope.$parent.datastore._entries.Groups_23["0"]._identifierValue;
                    theobj.api_group_id = scope.review.values.id;

                if(method == 'read') theobj.read = value;
                if(method == 'edit') theobj.edit = value;
                if(method == 'create') theobj.create = value;

                Restangular.one('grouprights').customPUT(theobj)
                    //.then(() => $state.reload())

                    .then(function successCallback(response) {
                        console.log(scope);
                        notification.log('Updated successfully', { addnCls: 'humane-flatty-success' });
                        }, function errorCallback(response) {
                        notification.log('Could not save changes', { addnCls: 'humane-flatty-error' });
                    });
            }
        },
        template:
            `
                <label class="btn btn-default">Read<input type="checkbox" ng-checked="review.values['grouprights.read'] == 1" ng-click="approve('read',review.values['grouprights.read'])" id="default" class="badgebox"><span class="badge">&check;</span></label>
                <label class="btn btn-default">Edit<input type="checkbox" ng-checked="review.values['grouprights.edit'] == 1" ng-click="approve('edit',review.values['grouprights.edit'])" id="default" class="badgebox"><span class="badge">&check;</span></label>
                <label class="btn btn-default">Create<input type="checkbox" ng-checked="review.values['grouprights.create'] == 1" ng-click="approve('create',review.values['grouprights.create'])" id="default" class="badgebox"><span class="badge">&check;</span></label>
            `
};
}

approveReview.$inject = ['Restangular', '$state', 'notification'];

export default approveReview;