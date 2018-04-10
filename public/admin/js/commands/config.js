import edit_button from '../edit_button.html';
import filter_genre_btn from '../filter_genre_btn.html';

export default function (nga, admin) {
    var commands = admin.getEntity('commands');
    commands.listView()
        .title('<h4>Commands <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
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

    commands.creationView()
        .title('<h4>Commands <i class="fa fa-angle-right" aria-hidden="true"></i> Send: command</h4>')
        .fields([
            nga.field('type', 'choice')
                .choices(function (entry) {
                    var types = [
                        { value: 'one', label: 'One User' },
                        { value: 'all', label: 'All User' }
                    ]
                    return types;
                })
                .label('User Type'),
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
            nga.field('toandroidsmartphone', 'boolean')
                .validation({ required: true })
                .label('Android Smartphone'),
            nga.field('toios', 'boolean')
                .validation({ required: true })
                .label('IOS'),
            nga.field('toandroidbox', 'boolean')
                .validation({ required: true })
                .label('Android Box'),
            nga.field('command', 'choice')
                .choices([
                    { value: 'file_replace', label: 'Replace file' },
                    { value: 'SOFTWARE_INSTALL', label: 'Software Installation' },
                    { value: 'DELETE_SHP', label: 'Delete shared preferences' },
                    { value: 'DELETE_DATA', label: 'Clear data' },
                    { value: 'debuggerd', label: 'Available free space' },
                    { value: 'pwd', label: 'Current directory name' },
                    { value: 'date', label: 'Current date and time' }
                ]).label('Command'),
            nga.field('command')
                .attributes({ placeholder: 'You can type your Command here' })
                .label('Write your Command')
                .template(
                    '<ma-input-field field="field" value="entry.values.command"></ma-input-field>'+
                    '<small id="emailHelp" class="form-text text-muted">If you write here, you must not choose from above field. Above field overwrite this field.</small>'
                    ),

            nga.field('parameter1', 'string')
                .attributes({ placeholder: 'parammeter1' })
                .label('Target'),
            nga.field('parameter2', 'string')
                .attributes({ placeholder: 'parammeter2' })
                .label('Destination'),
            nga.field('parameter3', 'string')
                .attributes({ placeholder: 'parammeter3' })
                .label('Options'),


            nga.field('sendtoactivedevices', 'boolean')
                .validation({ required: true })
                .defaultValue(true)
                .label('Send only to active devices'),
            nga.field('template')
                .label('')
                .template(edit_button),
        ]);
    return commands;

}