import edit_button from '../edit_button.html';

export default function (nga, admin) {
	var vodstreamsource = admin.getEntity('VodStreamSources');
	vodstreamsource.listView()
		.title('<h4>Vod Stream Sources <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
        .batchActions([])
		.fields([
			nga.field('description', 'string')
				.label('Stream Source'),
		])
		.listActions(['edit'])
        .exportFields([
         vodstreamsource.listView().fields(),
        ]);


	vodstreamsource.creationView()
        .title('<h4>Vod Stream Sources <i class="fa fa-angle-right" aria-hidden="true"></i> Create: Vod Stream Source</h4>')            
        .fields([
            nga.field('description', 'string')
                .attributes({ placeholder: 'Description' })
                .validation({ required: true })
                .label('Stream Source'),
            nga.field('template')
                .label('')
                .template(edit_button),
        ]);

    vodstreamsource.editionView()
        .title('<h4>Vod Stream Sources <i class="fa fa-angle-right" aria-hidden="true"></i> Edit: {{ entry.values.description }}</h4>')   
        .actions(['list'])         
        .fields([
            vodstreamsource.creationView().fields(),
        ]);

	return vodstreamsource;
	
}