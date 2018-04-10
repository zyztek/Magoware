import edit_button from '../edit_button.html';

export default function (nga, admin) {
	var packagetype = admin.getEntity('packagetypes');
	packagetype.listView()
		.title('<h4>Package Types <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
        .batchActions([])
		.fields([
            nga.field('description', 'string')
				.label('Description'),
		])
		.listActions(['edit'])

		
        .exportFields([
         packagetype.listView().fields(),
        ]);



	packagetype.creationView() 
        .title('<h4>Package Types <i class="fa fa-angle-right" aria-hidden="true"></i> Create: Package Type</h4>')           
        .fields([
            nga.field('description', 'string')
                .attributes({ placeholder: 'Description' })
                .validation({ required: true })
                .label('Description'),
            nga.field('template')
                .label('')
                .template(edit_button),
        ]);

    packagetype.editionView()
        .title('<h4>Package Types <i class="fa fa-angle-right" aria-hidden="true"></i> Edit: {{ entry.values.description }}</h4>')  
        .actions(['list'])         
        .fields([
            packagetype.creationView().fields(),
        ]);

	return packagetype;
	
}
