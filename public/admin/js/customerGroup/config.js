import edit_button from '../edit_button.html';

export default function (nga, admin) {
	var customergroup = admin.getEntity('CustomerGroups');

	customergroup.listView()
		.title('<h4>Customer Group <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
        .batchActions([])
		.fields([
			nga.field('description')
				.label('Description'),
		])
		.listActions(['edit'])
        .exportFields([
            customergroup.listView().fields(),
        ]);


	customergroup.creationView()
        .title('<h4>Customer Group <i class="fa fa-angle-right" aria-hidden="true"></i> Create: Customer Group</h4>')
        .fields([
            nga.field('description')
                .attributes({ placeholder: 'Name the group to identify customers types(for example staff)' })
                .validation({ required: true })
                .label('Description'),
            nga.field('template')
                .label('')
                .template(edit_button),
        ]);

    customergroup.editionView()
        .title('<h4>Customer Group <i class="fa fa-chevron-right" aria-hidden="true"></i>Edit: {{ entry.values.description }} </h4>')
        .actions(['list'])
        .fields([
            customergroup.creationView().fields(),
        ]);


	return customergroup;
	
}