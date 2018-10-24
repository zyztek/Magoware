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
                // .map(function truncate(value) {
                //     if (!value) {
                //         return 'No Stream Url';
                //     }
                //     return value.length > 25 ? value.substr(0, 25) + '...' : value;
                // })
                .label('Stream Url'),
            nga.field('stream_mode', 'choice')
                .attributes({ placeholder: 'Stream Format' })
                .choices([
                    { value: 'live', label: 'Live TV stream' },
                    { value: 'catchup', label: 'Catchup stream' }
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
                .attributes({ placeholder: 'Select Channel from dropdown list' })
                .validation({validator: function(value) {
                        if(value === null || value === ''){
                            throw new Error('Please Select Channel');
                        }
                    }
                })
                .perPage(-1)
                .label('Channel *'),
            nga.field('stream_source_id', 'reference')
                .targetEntity(admin.getEntity('ChannelStreamSources'))
                .targetField(nga.field('stream_source'))
                .validation({validator: function(value) {
                        if(value === null || value === ''){
                            throw new Error('Please Select Stream Source Id');
                        }
                    }
                })
                .attributes({ placeholder: 'Select Stream Source from dropdown list' })
                .perPage(-1)
                .label('Stream Source Id *'),
            nga.field('stream_url', 'string')
                .attributes({ placeholder: 'Channel Stream Url' })
                .validation({validator: function(value) {
                        if(value === null){
                            throw new Error('Please Select Stream Url');
                        } else if(value.indexOf('http://') == 0 || value.indexOf('https://') == 0 || value.indexOf('udp://') == 0 || value.indexOf('rtmp://') == 0){
                            document.getElementById('row-stream_url').classList.remove("has-error");
                            document.getElementById('row-stream_url').classList.add("has-success");
                        }else{
                            document.getElementById('row-stream_url').classList.add("has-error");
                            throw new Error('Invalid Url');
                        }
                    }
                })
                .label('Stream Url *'),
            nga.field('stream_mode', 'choice')
                .attributes({ placeholder: 'Select Channel Mode from dropdown list' })
                .choices([
                    { value: 'live', label: 'Live TV stream' },
                    { value: 'catchup', label: 'Catchup stream' }
                ])
                .validation({validator: function(value) {
                        if(value === null || value === ''){
                            throw new Error('Please Select Channel mode');
                        }
                    }
                })
                .label('Channel mode *'),
            nga.field('recording_engine', 'choice')
                .defaultValue('none')
                .choices([
                    { value: 'none', label: 'None' },
                    { value: 'wowza', label: 'Wowza' },
                    { value: 'flussonic', label: 'Flussonic' }
                ])
                .validation({validator: function(value) {
                        if(value === null || value === ''){
                            throw new Error('Please Select Recording Engine');
                        }
                    }
                })
                .template('<div>'+
                    '<ma-choice-field field="field" value="entry.values.recording_engine"></ma-choice-field>'+
                    '<small id="emailHelp" class="form-text text-muted">For catchup channels choose the Recording Engine from dropdown list. By default is None</small>'+
                    '</div>')
                .label('Recording Engine *'),
            nga.field('stream_resolution', 'choices')
                .attributes({ placeholder: 'Select screen types where this stream should play' })
                .choices([
                    { value: 'small', label: 'Small screens' },
                    { value: 'large', label: 'Large screens' }
                ])
                .validation({validator: function(value) {
                        if(value === null || value === ''){
                            throw new Error('Please Select Stream resolution');
                        }
                    }
                })
                .label('Stream resolution *'),

            nga.field('stream_format', 'choice')
                .attributes({ placeholder: 'Choose from dropdown list stream format , for example HLS format' })
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
                .validation({ required: false })
                .label('Token Url'),
            nga.field('encryption', 'boolean')
                .attributes({ placeholder: 'Encryption' })
                .validation({ required: true })
                .label('Encryption'),
            nga.field('encryption_url', 'string')
                .defaultValue('Encryption url')
                .validation({ required: false })
                .label('Encryption Url'),
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

            //hidden from UI
            nga.field('is_octoshape', 'boolean')
                .defaultValue(false)
                .validation({ required: false })
                .cssClasses('hidden')
                .label(''),
        ]);

    channelstream.editionView()
        .title('<h4>Channel Streams <i class="fa fa-angle-right" aria-hidden="true"></i> Edit: {{ entry.values.channel_id }}</h4>')
        .actions(['list', 'delete'])
        .fields([
            channelstream.creationView().fields(),
        ]);



    return channelstream;

}
