import edit_button from '../../edit_button.html';
//import set from './setting.html';

export default function (nga, admin) {
    var PlayerSettings = admin.getEntity('PlayerSettings');
    PlayerSettings.listView()
        .batchActions([])
        .fields([
            nga.field('activity_timeout' ,'number')
                .attributes({ placeholder: 'Activity Timeout' })
                .template('<div class="form-group">'+
                    '<ma-input-field field="field" value="entry.values.activity_timeout"></ma-input-field>'+
                    '<small id="emailHelp" class="form-text text-muted">If there is no activity for this time then application will return to main menu. Default value 3 hr</small>'+
                    '</div>')
                .label('Activity Time Out'),
            nga.field('log_event_interval' ,'number')
                .attributes({ placeholder: 'Log event interval' })
                .template('<div class="form-group">'+
                    '<ma-input-field field="field" value="entry.values.log_event_interval"></ma-input-field>'+
                    '<small id="emailHelp" class="form-text text-muted">Frequency to send audience logs.</small>'+
                    '</div>')
                .label('Log event interval'),

            nga.field('channel_log_time' ,'number')
                .attributes({ placeholder: 'Channel log time' })
                .template('<div class="form-group">'+
                    '<ma-input-field field="field" value="entry.values.channel_log_time"></ma-input-field>'+
                    '<small id="emailHelp" class="form-text text-muted">Timeout to define a channel as not able to play.</small>'+
                    '</div>')
                .label('Channel log time'),

            nga.field('vod_subset_nr' ,'number')
                .template('<div class="form-group">'+
                    '<ma-input-field field="field" value="entry.values.vod_subset_nr"></ma-input-field>'+
                    '<small id="emailHelp" class="form-text text-muted">Number of movies sent in each vod request</small>'+
                    '</div>')
                .label('Vod movies / request'),

            nga.field('template')
                .label('')
                .template(edit_button),

        ]);

    PlayerSettings.editionView()
        .title('<h4><i class="fa fa-angle-right" aria-hidden="true"></i> Player Settings</h4>')
        .actions([''])
        .onSubmitSuccess(['progression', 'notification', '$state', 'entry', 'entity', function(progression, notification, $state, entry, entity) {
            progression.done(); // stop the progress bar
            notification.log(`Element #${entry._identifierValue} successfully edited.`, { addnCls: 'humane-flatty-success' }); // add a notification
            // redirect to the list view
            $state.go($state.current, {}, {reload : true}); // cancel the default action (redirect to the edition view)
            return false;
        }])
        .fields([
            PlayerSettings.listView().fields(),
        ]);

    return PlayerSettings;

}