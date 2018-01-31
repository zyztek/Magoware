import edit_button from '../edit_button.html';

export default function (nga, admin) {
    var package_vod = admin.getEntity('package_vod');
    package_vod.listView()
        .title('<h4>Package Channels <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
        .batchActions([])
        .actions(['<ma-back-button entry="entry" entity="entity"></ma-back-button>'])
        .fields([
            nga.field('channel_id', 'reference')
                .targetEntity(admin.getEntity('Channels'))
                .targetField(nga.field('channel_number'))
                .label('Nr'),
            nga.field('channel_id', 'reference')
                .targetEntity(admin.getEntity('Channels'))
                .targetField(nga.field('icon_url', 'file')
                    .template('<img src="{{ entry.values.icon_url }}" height="35" width="35" />'))
                .label('Icon'),
            nga.field('channel_id', 'reference')
                .targetEntity(admin.getEntity('Channels'))
                .targetField(nga.field('title'))
                .label('Channels'),
            nga.field('channel_id', 'reference')
                .targetEntity(admin.getEntity('Channels'))
                .targetField(nga.field('genre.description'))
                .label('Genres'),
            nga.field('channel_id', 'reference')
                .targetEntity(admin.getEntity('Channels'))
                .targetField(nga.field('isavailable', 'boolean'))
                .label('Available'),
        ])
        .listActions(['<ma-delete-button label="Remove" entry="entry" entity="entity" size="xs"></ma-delete-button>'])

        .exportFields([
            package_vod.listView().fields(),
        ]);


    package_vod.deletionView()
        .title('<h4>Package Vod <i class="fa fa-angle-right" aria-hidden="true"></i> Remove <span style ="color:red;"> {{ entry.values.channel.title }} </span> from <span style ="color:red;"> {{ entry.values.package.package_name }} </span></h4>')
        .fields([
            nga.field('channel', 'template')
                .template(function (entry, value) {

                    return entry.values.channel.title;

                }),
            nga.field('package', 'template')
                .template(function (entry, value) {

                    return entry.values.package.package_name;

                }),
        ])
        .actions(['<ma-back-button entry="entry" entity="entity"></ma-back-button>'])

    package_vod.creationView()
        .onSubmitSuccess(['progression', 'notification', '$state', 'entry', 'entity', function(progression, notification, $state, entry, entity) {
            progression.done();
            $state.go($state.get('edit'), { entity: 'Packages', id: entry.values.package_id });
            return false;
        }])
        .title('<h4>Package Channels <i class="fa fa-angle-right" aria-hidden="true"></i> Create: Package Channels</h4>')
        .fields([
            nga.field('package_id', 'reference')
                .targetEntity(admin.getEntity('Packages'))
                .targetField(nga.field('package_name'))
                .validation({ required: true })
                .label('Packages'),
            nga.field('channel_id', 'reference')
                .targetEntity(admin.getEntity('Channels'))
                .targetField(nga.field('title', 'template')
                        .map((v, e) =>
                    e.channel_number + ' - ' +
                    e.title))
        .validation({ required: true })
        .attributes({ placeholder: 'Select Channel' })
        .perPage(1000)
        .label('Channels'),
        nga.field('template')
            .label('')
            .template(edit_button),
    ]);

    package_vod.editionView()
        .title('<h4>Package Channels <i class="fa fa-angle-right" aria-hidden="true"></i> Edit: {{ entry.values.channel_id }}</h4>')
        .actions(['list'])
        .fields([
            package_vod.creationView().fields(),
        ]);

    return package_vod;

}
