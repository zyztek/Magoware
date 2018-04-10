import edit_button from '../edit_button.html';
import filter_genre_btn from '../filter_genre_btn.html';

export default function (nga, admin) {
    var ads = admin.getEntity('ads');

    //todo: username ose allusers te jete required
    ads.listView()
        .title('<h4>Ads <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
        .fields([
            nga.field('login_datum.username')
                .label('Username'),
            nga.field('googleappid')
                .label('Device'),
            nga.field('command')
                .label('Action'),
            nga.field('status')
                .label('Status'),
            nga.field('createdAt', 'datetime')
                .label('Time sent')
        ])
        .filters([
            nga.field('username').label('User'),
            nga.field('command').label('Action'),
            nga.field('status', 'choice')
                .choices([
                    { value: 'sent', label: 'Outbox commands' },
                    { value: 'success', label: 'Executed commands' },
                    { value: 'failure', label: 'Failed commands' }
                ])
        ])
        .listActions([]);

    ads.creationView()
        .title('<h4>Ads <i class="fa fa-angle-right" aria-hidden="true"></i> Send: ad</h4>')
        .fields([
            nga.field('username', 'reference')
                .targetEntity(admin.getEntity('LoginData'))
                .targetField(nga.field('username')
                    .map(function (value) {
                        var user = [];
                        for (var i = 0; i < value.length; i++) {
                            user[i] = value[i].username;
                            return value;
                        }
                    }))
                .perPage(-1),
            nga.field('all_users', 'boolean')
                .validation({ required: true })
                .label('Send to all users (overrides username)'),
            nga.field('appid', 'choices')
                .attributes({ placeholder: 'Send to device type:' })
                .choices([
                    { value: 1, label: 'Android Set Top Box' },
                    { value: 2, label: 'Android Smart Phone' },
                    { value: 3, label: 'IOS' },
                    { value: 4, label: 'Android Smart TV' },
                    { value: 5, label: 'Samsung Smart TV' }
                ])
                .validation({required: true})
                .label('Applications IDs'),

            nga.field('activity', 'choices')
                .choices([
                    { value: 'livetv', label: 'In live tv' },
                    { value: 'vod', label: 'In vod' },
                    { value: 'all', label: 'Everywhere (overrules other values)' }
                ])
                .validation({required: true})
                .label('Display:'),

            nga.field('title', 'string')
                .label('Title'),
            nga.field('message', 'text')
                .label('Message'),
            nga.field('link_url', 'string')
                .template('<div class="form-group">'+
                    '<ma-input-field field="field" value="entry.values.link_url"></ma-input-field>'+
                    '<small id="emailHelp" class="form-text text-muted">Default empty string</small>'+
                    '</div>')
                .label('Link'),

            nga.field('xOffset', 'choice')
                .choices([
                    { value: '1', label: 'Top' },
                    { value: '2', label: 'Center' },
                    { value: '3', label: 'Bottom' }
                ]).validation({ required: true })
                .label('Position'),

            nga.field('imageGif', 'string')
                .validation({required: true})
                .label('Image link'),


            nga.field('duration', 'number')
                .template('<div class="form-group">'+
                    '<ma-input-field field="field" value="entry.values.duration"></ma-input-field>'+
                    '<small id="emailHelp" class="form-text text-muted">Ad duration. Default 5000 ms</small>'+
                    '</div>')
            .label('Duration in ms'),

            nga.field('delivery_time', 'datetime')
                .label('Send ad at:'),

            nga.field('template')
                .label('')
                .template(edit_button),
        ]);
    return ads;

}