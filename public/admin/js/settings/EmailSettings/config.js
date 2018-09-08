import edit_button from '../../edit_button.html';
//import set from './setting.html';

export default function (nga, admin) {
    var EmailSettings = admin.getEntity('EmailSettings');
    EmailSettings.listView()
        .batchActions([])
        .fields([
            nga.field('smtp_host')
                .validation({ required: true })
                .label('Smtp host')
                .template('<div class="form-group">'+
                    '<ma-input-field field="field" value="entry.values.smtp_host"></ma-input-field>'+
                    '<small id="emailHelp" class="form-text text-muted">Smtp host and port (smtp_host:port)</small>'+
                    '</div>')
                .attributes({ placeholder: 'smtp.gmail.com:465' }),
            nga.field('email_username')
                .validation({ required: true })
                .label('Email Username')
                .template('<div class="form-group">'+
                    '<ma-input-field field="field" value="entry.values.email_username"></ma-input-field>'+
                    '<small id="emailHelp" class="form-text text-muted">Username for outgoing smtp mail server.</small>'+
                    '</div>')
                .attributes({ placeholder: 'Username' }),
            nga.field('email_password', 'password')
                .validation({ required: true })
                .label('Email Password')
                .template('<div class="form-group">'+
                    '<ma-input-field field="field" type="password" value="entry.values.email_password"></ma-input-field>'+
                    '<small id="emailHelp" class="form-text text-muted">Password for outgoing smtp mail server.</small>'+
                    '</div>')
                .attributes({ placeholder: 'Password' }),
            nga.field('smtp_secure', 'choice')
                .defaultValue(true)
                .choices([
                    { value: false, label: 'Disable secure connection with Smtp server' },
                    { value: true, label: 'Enable secure connection with Smtp server' }
                ])
                .validation({ required: true})
                .template('<div class="form-group">'+
                    '<ma-choice-field field="field" value="entry.values.smtp_secure"></ma-choice-field>'+
                    '<small id="emailHelp" class="form-text text-muted">Consider your Smtp host configurations for this setting </small>'+
                    '</div>')
                .label('Secure connection'),
            nga.field('email_address')
                .validation({ required: true })
                .label('Email Address')
                .template('<div class="form-group">'+
                    '<ma-input-field field="field" value="entry.values.email_address"></ma-input-field>'+
                    '<small id="emailHelp" class="form-text text-muted">Email address appearing in the email details.</small>'+
                    '</div>')
                .attributes({ placeholder: 'Address' }),

            nga.field('template')
                .label('')
                .template(edit_button),

        ]);

    EmailSettings.editionView()
        .title('<h4><i class="fa fa-angle-right" aria-hidden="true"></i> Email Settings</h4>')
        .actions([''])
        .onSubmitSuccess(['progression', 'notification', '$state', 'entry', 'entity', function(progression, notification, $state, entry, entity) {
            progression.done(); // stop the progress bar
            notification.log(`Element #${entry._identifierValue} successfully edited.`, { addnCls: 'humane-flatty-success' }); // add a notification
            // redirect to the list view
            $state.go($state.current, {}, {reload : true}); // cancel the default action (redirect to the edition view)
            return false;
        }])
        .fields([
            EmailSettings.listView().fields(),
        ]);

    return EmailSettings;

}