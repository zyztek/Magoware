import edit_button from '../edit_button.html';

export default function (nga, admin) {
	var actv = admin.getEntity('activity');
	actv.listView()
		.title('<h4>App Management <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
		.batchActions([])
		.fields([
			nga.field('description', 'string')
				.label('Description'),
		])
		.listActions(['edit'])
        .exportFields([
         actv.listView().fields(),
        ]);


	actv.creationView()
		.title('<h4>App Management <i class="fa fa-angle-right" aria-hidden="true"></i> Create: APP</h4>')
        .fields([
        	nga.field('description', 'string')
        		 .attributes({ placeholder: 'Description' })
                .validation({ required: true })
				.label('Description'),
            nga.field('template')
            	.label('')
            	.template(edit_button),  
        ]);	

    actv.editionView()
    	.title('<h4>App Management <i class="fa fa-angle-right" aria-hidden="true"></i> Edit: {{ entry.values.title }}</h4>')
    	.actions(['list'])
        .fields([
            actv.creationView().fields(),
        ]);	
	    

	return actv;
	
}
