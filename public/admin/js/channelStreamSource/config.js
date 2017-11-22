import edit_button from '../edit_button.html';

export default function (nga, admin) {
    var channelstreamsource = admin.getEntity('ChannelStreamSources');
    channelstreamsource.listView()
        .title('<h4>Channel Stream Sources <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
        .batchActions([])
        .fields([
        	nga.field('stream_source', 'string')
        		.label('Stream Source'),
        ])
        .listActions(['edit'])
        .exportFields([
         channelstreamsource.listView().fields(),
        ]);


        
        channelstreamsource.creationView()
        .title('<h4>Channel Stream Sources <i class="fa fa-angle-right" aria-hidden="true"></i> Create: Channel Stream Source</h4>')
        .fields([
            nga.field('stream_source', 'string')
                .attributes({ placeholder: 'Stream Source' })
                .validation({ required: true })
                .label('Stream Source'),
            nga.field('template')
                .label('')
                .template(edit_button),
        ]);

    channelstreamsource.editionView()
        .title('<h4>Channel Stream Sources <i class="fa fa-angle-right" aria-hidden="true"></i> Edit: {{ entry.values.stream_source }}</h4>')
        .actions(['list'])
        .fields([
            channelstreamsource.creationView().fields(),
            nga.field('ChannelStreams', 'referenced_list')
                    	.label('Channels')
                    	.targetEntity(admin.getEntity('ChannelStreams'))
                    	.targetReferenceField('stream_source_id')
                .targetFields([
                    nga.field('channel_id', 'reference')
						.targetEntity(admin.getEntity('Channels'))
						.targetField(nga.field('channel_number'))
                		.label('Nr'),
                	nga.field('channel_id', 'reference')
                		.targetEntity(admin.getEntity('Channels'))
		                .targetField(nga.field('icon_url')
		                .template('<img src="{{ entry.values.icon_url }}" height="35" width="35" />'))
		                .cssClasses('hidden-xs')
		                .label('Icon'),
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
		                            return '';
		                        }
		                            return value.length > 25 ? value.substr(0, 25) + '...' : value;
		                        })
		        		.label('Stream Url'),        	
                ])
                .listActions(['edit'])
                .perPage(15),
        ]);
    


    return channelstreamsource;

}