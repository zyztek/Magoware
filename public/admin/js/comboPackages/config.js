import edit_button from '../edit_button.html';

export default function (nga, admin) {
	var combopackages = admin.getEntity('comboPackages');
	combopackages.listView()
		.title('<h4>Combo Packages <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
        .batchActions([])
		.fields([
			nga.field('package_id', 'reference')
				.targetEntity(admin.getEntity('Packages'))
                .targetField(nga.field('package_name'))
				.label('Package'),
			nga.field('combo_id', 'reference')
				.targetEntity(admin.getEntity('Combos'))
                .targetField(nga.field('name'))
				.label('Combo'),
		])
		.listActions(['edit'])
		.exportFields([
         combopackages.listView().fields(),
        ]);


    combopackages.deletionView()
        .title('<h4>Combo Packages <i class="fa fa-angle-right" aria-hidden="true"></i> Remove <span style ="color:red;"> {{ entry.values.package.package_name }} </span> from <span style ="color:red;"> {{ entry.values.combo.name }} </span></h4>')
        .fields([
            nga.field('combo', 'template')
					.template(function (entry, value) {
                        return entry.values.combo.name;
					}),
            nga.field('package', 'template')
                    .template(function (entry, value) {
                        return entry.values.package.package_name;
            }),
        ])               
        .actions(['<ma-back-button entry="entry" entity="entity"></ma-back-button>'])

	combopackages.creationView()
		.onSubmitSuccess(['progression', 'notification', '$state', 'entry', 'entity', function(progression, notification, $state, entry, entity) {
            progression.done();
            $state.go($state.get('edit'), { entity: 'Combos', id: entry.values.combo_id });
            return false;
        }])
		.title('<h4>Link Package with Combo/Plan</h4>')
        .fields([
            nga.field('combo_id', 'reference')
				.targetEntity(admin.getEntity('Combos'))
                .targetField(nga.field('name'))
				.perPage(-1)
				.validation({ required: true })
				.label('Product'),
            nga.field('package_id', 'reference')
            	.targetEntity(admin.getEntity('Packages'))
                .targetField(nga.field('package_name')
				.map(function getpckdes(value, entry) {
					return (entry["package_name"] + ' - ' + entry["package_type.description"]);
				}))
				.perPage(-1)
				.validation({ required: true })
                .attributes({ placeholder: 'Select packages' })
				.label('Package'),
            nga.field('template')
            	.label('')
            	.template(edit_button), 
        ]);

    combopackages.editionView()
    	.title('<h4>Combo Packages <i class="fa fa-angle-right" aria-hidden="true"></i> Edit: {{ entry.values.combo_id }}</h4>')
        .actions(['list'])
        .fields([
            combopackages.creationView().fields(),
        ]);


	return combopackages;
	
}