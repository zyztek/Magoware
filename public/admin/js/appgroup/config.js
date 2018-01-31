import edit_button from '../edit_button.html';

export default function (nga, admin) {
	var app_gr = admin.getEntity('appgroup');
	app_gr.listView()
			.title('<h4>App Group <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
			.batchActions([])
			.fields([
				nga.field('app_group_id')
						.label('App Group ID'),
				nga.field('app_group_name')
						.label('App Group Name'),
				nga.field('app_id')
						.label('App ID'),
			])
			.listActions(['edit'])


			.exportFields([
				app_gr.listView().fields(),
			]);


	app_gr.creationView()
			.title('<h4>App Group <i class="fa fa-angle-right" aria-hidden="true"></i> Create: APP</h4>')
			.fields([
				nga.field('app_group_id')
						.attributes({ placeholder: 'App Group ID' })
						.validation({ required: true })
						.label('App Group ID'),
				nga.field('app_group_name')
						.attributes({ placeholder: 'App Group Name' })
						.validation({ required: true })
						.label('App Group Name'),
				nga.field('app_id')
						.attributes({ placeholder: 'App ID' })
						.validation({ required: true })
						.label('App ID'),

				nga.field('template')
						.label('')
						.template(edit_button),
			]);

	app_gr.editionView()
			.title('<h4>App Group <i class="fa fa-angle-right" aria-hidden="true"></i> Edit: {{ entry.values.title }}</h4>')
			.actions(['list'])
			.fields([
				app_gr.creationView().fields(),
			]);


	return app_gr;

}