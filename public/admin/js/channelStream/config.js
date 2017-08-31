import edit_button from '../edit_button.html';

export default function (nga, admin) {
    var channelstream = admin.getEntity('ChannelStreams');
    channelstream.listView()
        .title('<h4>Channel Streams <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
        .batchActions([])
        .fields([
            nga.field('channel_id' , 'reference')
                .targetEntity(admin.getEntity('Channels'))
                .targetField(nga.field('channel_number'))
                .label('Nr'),
        	nga.field('channel_id' , 'reference')
                .targetEntity(admin.getEntity('Channels'))
                .targetField(nga.field('title'))
        		.label('Channel'),
        	nga.field('stream_source_id', 'reference')
                .targetEntity(admin.getEntity('ChannelStreamSources'))
                .targetField(nga.field('stream_source'))
        		.label('Stream Source'),
        	nga.field('stream_url', 'string')
                .map(function truncate(value) {
                    if (!value) {
                            return 'No Stream Url';
                        }
                            return value.length > 25 ? value.substr(0, 25) + '...' : value;
                        })
        		.label('Stream Url'),
            nga.field('stream_mode', 'choice')
                .attributes({ placeholder: 'Stream Format' })
                .choices([
                    { value: 'live', label: 'Live TV channel' },
                    { value: 'catchup', label: 'Catchup channel' }
                ])
                .validation({ required: true })
                .cssClasses('hidden-xs')
                .label('Stream mode'),
        	nga.field('token_url', 'string')
                .map(function truncate(value) {
                    if (!value) {
                            return 'No Token Url';
                        }
                            return value.length > 25 ? value.substr(0, 25) + '...' : value;
                        })
        		.label('Token Url'),
            nga.field('encryption_url', 'string')
                .label('Encryption Url'),
            nga.field('token', 'boolean')
                .label('Token'),
        	nga.field('encryption', 'boolean')
        		.label('Encryption'),
            nga.field('stream_format', 'choice')
                .choices([
                    { value: 0, label: 'MPEG Dash' },
                    { value: 1, label: 'Smooth Streaming' },
                    { value: 2, label: 'HLS' },
                    { value: 3, label: 'OTHER' }
                ])
                .validation({ required: true })
                .label('Stream Format'),
        	
        ])
        .listActions(['edit'])

       
        .exportFields([
         channelstream.listView().fields(),
        ]);


    channelstream.deletionView()
        .title('<h4>Channel Streams <i class="fa fa-angle-right" aria-hidden="true"></i> Remove <span style ="color:red;"> Streams')
        .actions(['<ma-back-button entry="entry" entity="entity"></ma-back-button>'])

    channelstream.creationView()
        .title('<h4>Channel Streams <i class="fa fa-angle-right" aria-hidden="true"></i> Create: Channel Stream</h4>')
        .onSubmitSuccess(['progression', 'notification', '$state', 'entry', 'entity', function(progression, notification, $state, entry, entity) {
            progression.done();
            $state.go($state.get('edit'), { entity: 'Channels', id: entry.values.channel_id });
            return false;
        }])
        .fields([
            nga.field('channel_id', 'reference')
                .targetEntity(admin.getEntity('Channels'))
                .targetField(nga.field('title'))
                .attributes({ placeholder: 'Select Channel' })
                .validation({ required: true })
                .perPage(-1)
                .label('Channel'),
            nga.field('stream_source_id', 'reference')
                .targetEntity(admin.getEntity('ChannelStreamSources'))
                .targetField(nga.field('stream_source'))
                .attributes({ placeholder: 'Select Stream Source' })
                .validation({ required: true })
                .perPage(-1)
                .label('Stream Source Id'),
            nga.field('stream_url', 'string')
                .attributes({ placeholder: 'Stream Url' })
                .validation({ required: true })
                .label('Stream Url'),
            nga.field('stream_mode', 'choice')
                .attributes({ placeholder: 'Stream Format' })
                .choices([
                    { value: 'live', label: 'Live TV channel' },
                    { value: 'catchup', label: 'Catchup  channel' }
                ])
                .validation({ required: true })
                .attributes({ placeholder: 'Description' })
                .validation({ required: true })
                .label('Channel mode'),
            nga.field('stream_format', 'choice')
                .attributes({ placeholder: 'Stream Format' })
                .choices([
                    { value: 0, label: 'MPEG Dash' },
                    { value: 1, label: 'Smooth Streaming' },
                    { value: 2, label: 'HLS' },
                    { value: 3, label: 'OTHER' }
                ])
                .validation({ required: true })
                .label('Stream Format'),
            nga.field('is_octoshape', 'boolean')
                .validation({ required: true })
                .label('Is Octoshape'),
            nga.field('token', 'boolean')
                .attributes({ placeholder: 'Token' })
                .validation({ required: true })
                .label('Token'),
            nga.field('token_url', 'string')
                .attributes({ placeholder: 'Token Url' })
                .validation({ required: true })
                .label('Token Url'),
            nga.field('encryption', 'boolean')
                .attributes({ placeholder: 'Encryption' })
                .validation({ required: true })
                .label('Encryption'),
            nga.field('encryption_url', 'string')
                .attributes({ placeholder: 'Encryption Url' })
                .validation({ required: true })
                .label('Encryption Url'),
            nga.field('template')
                    .label('')
                    .template(edit_button),                
        ]);

    channelstream.editionView()
        .title('<h4>Channel Streams <i class="fa fa-angle-right" aria-hidden="true"></i> Edit: {{ entry.values.channel_id }}</h4>')
        .actions(['list', 'delete'])
        .fields([
            channelstream.creationView().fields(),
        ]);

    

    return channelstream;

}
