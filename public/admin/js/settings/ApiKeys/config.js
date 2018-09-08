import edit_button from '../../edit_button.html';
//import set from './setting.html';

export default function (nga, admin) {
    var ApiKeys = admin.getEntity('ApiKeys');
    ApiKeys.listView()
        .batchActions([])
        .fields([
            nga.field('new_encryption_key')
                .validation({ required: true, minlength: 16, maxlength: 16 })
                .label('New Encryption Key')
                .template('<div class="form-group">'+
                    '<ma-input-field field="field" value="entry.values.new_encryption_key"></ma-input-field>'+
                    '<small id="emailHelp" class="form-text text-muted">Key used to encrypt/decrypt token. 16 characters long</small>'+
                    '</div>'),
            nga.field('key_transition', 'boolean')
                .validation({ required: true })
                .label('Key Transition'),
            nga.field('firebase_key', 'text')
                .validation({ required: true })
                .label('Firebase key'),
            nga.field('akamai_token_key', 'string')
                .label('Akamai  token key'),
            nga.field('flussonic_token_key', 'string')
                .label('Flussonic token key'),

            nga.field('template')
                .label('')
                .template(edit_button),

        ]);

    ApiKeys.editionView()
        .title('<h4><i class="fa fa-angle-right" aria-hidden="true"></i> Api Keys</h4>')
        .actions([''])
        .onSubmitSuccess(['progression', 'notification', '$state', 'entry', 'entity', function(progression, notification, $state, entry, entity) {
            progression.done(); // stop the progress bar
            notification.log(`Element #${entry._identifierValue} successfully edited.`, { addnCls: 'humane-flatty-success' }); // add a notification
            // redirect to the list view
            $state.go($state.current, {}, {reload : true}); // cancel the default action (redirect to the edition view)
            return false;
        }])
        .fields([
            ApiKeys.listView().fields(),
        ]);

    return ApiKeys;

}