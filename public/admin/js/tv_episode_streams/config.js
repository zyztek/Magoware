import edit_button from '../edit_button.html';

export default function (nga, admin) {
    var tv_episode_streams = admin.getEntity('tv_episode_streams');
    tv_episode_streams.listView()
        .title('<h4>Episode Streams <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
        .batchActions([])
        .fields([
            nga.field('tv_episode_id', 'reference')
                .targetEntity(admin.getEntity('VodEpisode'))
                .targetField(nga.field('title'))
                .label('Episode'),
            nga.field('stream_source_id', 'reference')
                .targetEntity(admin.getEntity('VodStreamSources'))
                .targetField(nga.field('description'))
                .label('Stream Source'),
            nga.field('tv_episode_url', 'string')
                // .map(function truncate(value) {
                // 	if (!value) {
                //            return '';
                //      	}
                //            return value.length > 25 ? value.substr(0, 25) + '...' : value;
                //      	})
                .label('Url'),
            nga.field('token', 'boolean')
                .label('Token'),
            nga.field('encryption', 'boolean')
                .label('Encryption'),
            nga.field('token_url', 'string')
                .label('Token Url'),
        ])
        .listActions(['edit'])
        .exportFields([
            tv_episode_streams.listView().fields(),
        ]);

    tv_episode_streams.deletionView()
        .title('<h4>Episode Streams <i class="fa fa-angle-right" aria-hidden="true"></i> Remove <span style ="color:red;"> Episode Streams')
        .actions(['<ma-back-button entry="entry" entity="entity"></ma-back-button>'])

    tv_episode_streams.creationView()
        .title('<h4>Episode Streams <i class="fa fa-angle-right" aria-hidden="true"></i> Create: Episode Stream</h4>')
        .onSubmitSuccess(['progression', 'notification', '$state', 'entry', 'entity', function(progression, notification, $state, entry, entity) {
            progression.done();
            $state.go($state.get('edit'), { entity: 'VodEpisode', id: entry.values.tv_episode_id });
            return false;
        }])
        .fields([
            nga.field('tv_episode_id', 'reference')
                .targetEntity(admin.getEntity('VodEpisode'))
                .targetField(nga.field('title'))
                .attributes({ placeholder: 'Choose from dropdown list of Episodes' })
                .validation({validator: function(value) {
                    if(value === null || value === ''){
                        throw new Error('Please Select Episode');
                    }
                }
                })
                .perPage(-1)
                .label('Episode *'),
            nga.field('stream_source_id', 'reference')
                .targetEntity(admin.getEntity('VodStreamSources'))
                .targetField(nga.field('description'))
                .attributes({ placeholder: 'Stream Source' })
                .validation({validator: function(value) {
                    if(value === null || value === ''){
                        throw new Error('Please Select Stream Source');
                    }
                }
                })
                .perPage(-1)
                .label('Stream Source *'),
            nga.field('tv_episode_url', 'string')
                .attributes({ placeholder: 'Episode Stream Url' })
                .validation({validator: function(value) {
                    if(value === null || value === ''){
                        throw new Error('Please Select Url');
                    }
                }
                })
                .label('Url *'),
            nga.field('stream_resolution', 'choices')
                .attributes({ placeholder: 'Select screen types where this stream should play' })
                .choices([
                    { value: 1, label: 'Android Set Top Box' },
                    { value: 2, label: 'Android Smart Phone' },
                    { value: 3, label: 'IOS' },
                    { value: 4, label: 'Android Smart TV' },
                    { value: 5, label: 'Samsung Smart TV' },
                    { value: 6, label: 'Apple TV' }
                ])
                .defaultValue([1,2,3,4,5,6])
                .validation({validator: function(value) {
                    if(value === null || value === ''){
                        throw new Error('Please Select Stream resolution');
                    }
                }
                })
                .label('Stream resolution *'),
            nga.field('stream_format', 'choice')
                .attributes({ placeholder: 'Stream Format' })
                .choices([
                    { value: 0, label: 'MPEG Dash' },
                    { value: 1, label: 'Smooth Streaming' },
                    { value: 2, label: 'HLS' },
                    { value: 3, label: 'OTHER' }
                ])
                .validation({validator: function(value) {
                    if(value === null || value === ''){
                        throw new Error('Please Select Stream Format');
                    }
                }
                })
                .label('Stream Format *'),
            nga.field('token', 'boolean')
                .attributes({ placeholder: 'Token' })
                .validation({ required: true })
                .label('Token'),
            nga.field('token_url', 'string')
                .defaultValue('Token Url')
                .attributes({ placeholder: 'Token Url' })
                .validation({ required: true })
                .label('Token Url'),
            nga.field('encryption', 'boolean')
                .validation({ required: true })
                .label('Encryption'),
            nga.field('encryption_url', 'string')
                .defaultValue('Encryption url')
                .validation({ required: true })
                .label('Encryption url'),
            nga.field('drm_platform', 'choice')
                .attributes({ placeholder: 'Select from dropdown list' })
                .defaultValue('none')
                .choices([
                    { value: 'none', label: 'None' },
                    { value: 'pallycon', label: 'Pallycon' },
                    { value: 'verimatrix', label: 'Verimatrix' },
                    { value: 'widevine', label: 'Widevine' }
                ])
                .validation({validator: function(value) {
                    if(value === null || value === ''){
                        throw new Error('Please Select DRM Platform');
                    }
                }
                })
                .label('DRM Platform *'),
            nga.field('template')
                .label('')
                .template(edit_button),
        ]);


    tv_episode_streams.editionView()
        .title('<h4>Episode Streams <i class="fa fa-angle-right" aria-hidden="true"></i> Edit: {{ entry.values.tv_episode_id }}</h4>')
        .actions(['list', 'delete'])
        .fields([
            tv_episode_streams.creationView().fields(),
        ]);


    return tv_episode_streams;

}
