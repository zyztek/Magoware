import edit_button from '../edit_button.html';

export default function (nga, admin) {
    var logs = admin.getEntity('logs');
    logs.listView()
        .title('<h4>User logs <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
        .batchActions([])
        .fields([
            nga.field('id', 'number')
                .label('ID'),
            nga.field('username', 'string')
                .label('User'),
            nga.field('user_ip', 'string')
                .label('from ip'),
            nga.field('action', 'string')
                .label('action'),
            nga.field('createdAt', 'datetime')
                .label('date')
        ])
        .listActions(['show'])

    logs.showView()
        .title('<h4>Logs <i class="fa fa-angle-right" aria-hidden="true"></i> Details</h4>')
        .fields([
            nga.field('id', 'number')
                .label('ID'),
            nga.field('user.username', 'string')
                .label('User'),
            nga.field('user_ip', 'string')
                .label('from ip'),
            nga.field('action', 'string')
                .label('action'),
            nga.field('details', 'json')
                .map(function detailsdecode(value, entry) {
                    return JSON.parse(value);
                })
                .label('details'),
            nga.field('createdAt', 'date')
                .label('date')
        ])

    return logs;

}