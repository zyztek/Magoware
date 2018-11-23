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
            var obj = scope.$parent.datastore._entries; //saves group-related data into variable obj

            scope.review = scope.review();
            scope.type = attrs.type;
            scope.approve = function(method,value) {

                if(!value) value = true
                else value = !value;

                var theobj = {};
                theobj.group_id = obj[Object.keys(obj)[0]]["0"]._identifierValue; // reads the value from the first property, since name of the property can vary
                theobj.api_group_id = scope.review.values.id;

                if(method == 'read') theobj.read = value;
                if(method == 'edit') theobj.edit = value;
                if(method == 'create') theobj.create = value;

                Restangular.one('grouprights').customPUT(theobj)
                    .then(function successCallback(response) {
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