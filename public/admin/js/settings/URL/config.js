import edit_button from '../../edit_button.html';
//import set from './setting.html';

export default function (nga, admin) {
    var URL = admin.getEntity('URL');
    URL.listView()
        .batchActions([])
        .fields([
            nga.field('help_page', 'string')
                .validation({ required: true })
                .label('Help and Support website')
                .template('<div class="form-group">'+
                    '<ma-input-field field="field" value="entry.values.help_page"></ma-input-field>'+
                    '<small id="emailHelp" class="form-text text-muted">Configure application help page (By default /help_and_support)</small>'+
                    '</div>'),
            nga.field('online_payment_url', 'string')
                .validation({ required: true })
                .label('Online payment web page')
                .template('<div class="form-group">'+
                    '<ma-input-field field="field" value="entry.values.online_payment_url"></ma-input-field>'+
                    '<small id="emailHelp" class="form-text text-muted">Configure web page for online payments from application</small>'+
                    '</div>'),
            nga.field('assets_url', 'string')
                .validation({ required: true })
                .label('Assets URL')
                .template('<div class="form-group">'+
                    '<ma-input-field field="field" value="entry.values.assets_url"></ma-input-field>'+
                    '<small id="emailHelp" class="form-text text-muted">URL to provide images through a CDN.</small>'+
                    '</div>')
                .attributes({ placeholder: 'Assets URL' }),

            nga.field('template')
                .label('')
                .template(edit_button),

        ]);

    URL.editionView()
        .title('<h4><i class="fa fa-angle-right" aria-hidden="true"></i> URLs</h4>')
        .actions([''])
        .onSubmitSuccess(['progression', 'notification', '$state', 'entry', 'entity', function(progression, notification, $state, entry, entity) {
            progression.done(); // stop the progress bar
            notification.log(`Element #${entry._identifierValue} successfully edited.`, { addnCls: 'humane-flatty-success' }); // add a notification
            // redirect to the list view
            $state.go($state.current, {}, {reload : true}); // cancel the default action (redirect to the edition view)
            return false;
        }])
        .fields([
            URL.listView().fields(),
        ]);

    return URL;

}