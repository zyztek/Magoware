import edit_button from '../edit_button.html';

export default function (nga, admin) {
	var vodstream = admin.getEntity('vodstreams');
	vodstream.listView()
		.title('<h4>Vod Streams <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
		.batchActions([])
		.fields([
			nga.field('vod_id', 'reference')
				.targetEntity(admin.getEntity('Vods'))
                .targetField(nga.field('title'))
				.label('Vod'),
			nga.field('stream_source_id', 'reference')
				.targetEntity(admin.getEntity('VodStreamSources'))
                .targetField(nga.field('description'))
				.label('Stream Source'),
			nga.field('url', 'string')
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
         vodstream.listView().fields(),
        ]);

    vodstream.deletionView()
        .title('<h4>Vod Streams <i class="fa fa-angle-right" aria-hidden="true"></i> Remove <span style ="color:red;"> Vod Streams')
        .actions(['<ma-back-button entry="entry" entity="entity"></ma-back-button>'])

    vodstream.creationView()
        .title('<h4>Vod Streams <i class="fa fa-angle-right" aria-hidden="true"></i> Create: Vod Stream</h4>')
        .onSubmitSuccess(['progression', 'notification', '$state', 'entry', 'entity', function(progression, notification, $state, entry, entity) {
            progression.done();
            $state.go($state.get('edit'), { entity: 'Vods', id: entry.values.vod_id });
            return false;
        }])
        .fields([
            nga.field('vod_id', 'reference')
                .targetEntity(admin.getEntity('Vods'))
                .targetField(nga.field('title'))
                .attributes({ placeholder: 'Choose from dropdown list VOD Movie' })
                .validation({validator: function(value) {
                        if(value === null){
                            throw new Error('Please Select Vod');
                        }
                    }
                })
                .perPage(-1)
                .label('Vod'),
            nga.field('stream_source_id', 'reference')
                .targetEntity(admin.getEntity('VodStreamSources'))
                .targetField(nga.field('description'))
                .attributes({ placeholder: 'Stream Source' })
                .validation({validator: function(value) {
                        if(value === null){
                            throw new Error('Please Select Stream Source');
                        }
                    }
                })
                .perPage(-1)
                .label('Stream Source'),
            nga.field('url', 'string')
                .attributes({ placeholder: 'Movie Stream Url' })
                .validation({validator: function(value) {
                        if(value === null){
                            throw new Error('Please Select Url');
                        }
                    }
                })
                .label('Url'),
            nga.field('stream_format', 'choice')
                .attributes({ placeholder: 'Stream Format' })
                .choices([
                    { value: 0, label: 'MPEG Dash' },
                    { value: 1, label: 'Smooth Streaming' },
                    { value: 2, label: 'HLS' },
                    { value: 3, label: 'OTHER' }
                ])
                .validation({validator: function(value) {
                        if(value === null){
                            throw new Error('Please Select Stream Format');
                        }
                    }
                })
                .label('Stream Format'),
            nga.field('token', 'boolean')
                .attributes({ placeholder: 'Token' })
                .validation({ required: true })
                .label('Token'),
            nga.field('token_url', 'string')
                .defaultValue('Token Url')
                .attributes({ placeholder: 'Token Url' })
                .validation({ required: false })
                .label('Token Url'),
            nga.field('encryption', 'boolean')
                .validation({ required: true })
                .label('Encryption'),
            nga.field('encryption_url', 'string')
                .defaultValue('Encryption url')
                .validation({ required: false })
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
                        if(value === null){
                            throw new Error('Please Select DRM Platform');
                        }
                    }
                })
                .label('DRM Platform'),
            nga.field('template')
                .label('')
                .template(edit_button),
        ]);


    vodstream.editionView()
    	.title('<h4>Vod Streams <i class="fa fa-angle-right" aria-hidden="true"></i> Edit: {{ entry.values.vod_id }}</h4>')  
    	.actions(['list', 'delete'])         
        .fields([
            vodstream.creationView().fields(),
        ]);


	return vodstream;
	
}
