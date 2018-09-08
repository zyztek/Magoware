import edit_button from '../edit_button.html';
//import set from './setting.html';

export default function (nga, admin) {
    var settings = admin.getEntity('Settings');
    settings.listView()
        .batchActions([])
        .fields([
            nga.field('analytics_id' ,'string')
                .attributes({ placeholder: 'Analytics ID' })
                .template('<div class="form-group">'+
                    '<ma-input-field field="field" value="entry.values.analytics_id"></ma-input-field>'+
                    '<small id="emailHelp" class="form-text text-muted">Google analytics ID to monitor audience and system logs.</small>'+
                    '</div>')
                .label('Analytics ID'),
            nga.field('company_name', 'string')
                .validation({ required: true })
                .label('Company name')
                .template('<div class="form-group">'+
                    '<ma-input-field field="field" value="entry.values.company_name"></ma-input-field>'+
                    '<small id="emailHelp" class="form-text text-muted">Set your company name (By default - MAGOWARE)</small>'+
                    '</div>'),
            nga.field('locale', 'string')
                .validation({ required: true })
                .label('Locale')
                .template('<div class="form-group">'+
                    '<ma-input-field field="field" value="entry.values.locale"></ma-input-field>'+
                    '<small id="emailHelp" class="form-text text-muted">User interface language (not in use).</small>'+
                    '</div>'),
            nga.field('allow_guest_login','boolean')
                .label('')
                .template('<form ng-app="myApp" ng-controller="checkboxController">'+
                    '<div class="form-check">'+
                    '<label class="toggle">'+
                    '<input type="checkbox" name="toggle" ng-model="checkboxModel.value1"'+
                    'ng-true-value="true" ng-false-value="false"> <span class="label-text">Allow Guest Login</span>'+
                    '</label>'+
                    '</div>'+
                    '</form>'),

            nga.field('template')
                .label('')
                .template(edit_button),

            //HIDDEN FROM UI
            nga.field('updatedAt', 'datetime')
                .cssClasses('hidden')
                .editable(false)
                .label(''),
            nga.field('menulastchange', 'datetime')
                .cssClasses('hidden')
                .editable(false)
                .label(''),
            nga.field('updatemenulastchange', 'boolean')
                .cssClasses('hidden')
                .editable(true)
                .validation({ required: false })
                .label(''),
            nga.field('livetvlastchange', 'datetime')
                .cssClasses('hidden')
                .editable(false)
                .label(''),
            nga.field('updatelivetvtimestamp', 'boolean')
                .cssClasses('hidden')
                .editable(true)
                .validation({ required: false })
                .label(''),
            nga.field('vodlastchange', 'datetime')
                .cssClasses('hidden')
                .editable(false)
                .label(''),
            nga.field('updatevodtimestamp', 'boolean')
                .cssClasses('hidden')
                .editable(true)
                .validation({ required: false })
                .label(''),
            nga.field('googlegcmapi')
                .template('<div class="form-group" style="display: none;">'+
                    '<ma-input-field field="field" value="entry.values.googlegcmapi"></ma-input-field>'+
                    '<small id="emailHelp" class="form-text text-muted">Google GCM API code for push messages to android devices.</small>'+
                    '</div>')
                .label(''),
            nga.field('applekeyid')
                .template('<div class="form-group" style="display: none;">'+
                    '<ma-input-field field="field" value="entry.values.applekeyid"></ma-input-field>'+
                    '<small id="emailHelp" class="form-text text-muted">Apple key id for push messages to apple devices.</small>'+
                    '</div>')
                .label(''),
            nga.field('appleteamid')
                .template('<div class="form-group" style="display: none;">'+
                    '<ma-input-field field="field" value="entry.values.appleteamid"></ma-input-field>'+
                    '<small id="emailHelp" class="form-text text-muted">Apple team id for push messages to apple devices.</small>'+
                    '</div>')
                .label(''),
            nga.field('applecertificate', 'text')
                .template('<div class="form-group" style="display: none;">'+
                    '<ma-text-field field="field" value="entry.values.applecertificate"></ma-text-field>'+
                    '<small id="emailHelp" class="form-text text-muted">Apple team id for push messages to apple devices.</small>'+
                    '</div>')
                .label(''),
            //./HIDDEN FROM UI
        ]);

    settings.editionView()
        .title('<h4><i class="fa fa-angle-right" aria-hidden="true"></i> Other</h4>')
        .actions([''])
        .onSubmitSuccess(['progression', 'notification', '$state', 'entry', 'entity', function(progression, notification, $state, entry, entity) {
            progression.done(); // stop the progress bar
            notification.log(`Element #${entry._identifierValue} successfully edited.`, { addnCls: 'humane-flatty-success' }); // add a notification
            // redirect to the list view
            $state.go($state.current, {}, {reload : true}); // cancel the default action (redirect to the edition view)
            return false;
        }])
        .fields([
            settings.listView().fields(),
        ]);

    return settings;

}