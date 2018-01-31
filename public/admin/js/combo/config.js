import edit_button from '../edit_button.html';

export default function (nga, admin) {
	var combo = admin.getEntity('Combos');
	combo.listView()
			.title('<h4>Products & Services <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
			.batchActions([])
			.fields([
				nga.field('name', 'string')
						.isDetailLink(true)
						.label('Name'),
				nga.field('duration')
						.cssClasses('hidden-xs')
						.label('Duration'),
				nga.field('value', 'number')
						.cssClasses('hidden-xs')
						.label('Value'),
				nga.field('isavailable', 'boolean')
						.label('Available'),
			])
			.listActions(['edit'])
			.exportFields([
				combo.listView().fields(),
			]);


	combo.creationView()
			.onSubmitSuccess(['progression', 'notification', '$state', 'entry', 'entity', function(progression, notification, $state, entry, entity) {
				progression.done();
				$state.go($state.get('edit'), { entity: entity.name(), id: entry._identifierValue });
				return false;
			}])
			.title('<h4>Products & Services <i class="fa fa-angle-right" aria-hidden="true"></i> Create: Product</h4>')
			.fields([
				nga.field('name', 'string')
						.attributes({ placeholder: 'Name' })
						.validation({ required: true })
						.label('Name'),
				nga.field('duration')
						.attributes({ placeholder: 'Duration' })
						.validation({ required: true })
						.label('Duration'),
				nga.field('value', 'number')
						.attributes({ placeholder: 'Value' })
						.validation({ required: true })
						.label('Value'),
				nga.field('isavailable', 'boolean')
						.attributes({ placeholder: 'Is Available' })
						.validation({ required: true })
						.label('Is Available'),
				nga.field('template')
						.label('')
						.template(edit_button),
			]);

	combo.editionView()
			.actions(['list'])
			.title('<h4>Products & Services <i class="fa fa-angle-right" aria-hidden="true"></i> Edit: {{ entry.values.name }}</h4>')
			.fields([
				combo.creationView().fields(),
				nga.field('', 'referenced_list')
						.label('Packages')
						.targetEntity(admin.getEntity('comboPackages'))
						.targetReferenceField('combo_id')
						.targetFields([
							nga.field('package_id', 'reference')
									.targetEntity(admin.getEntity('Packages'))
									.targetField(nga.field('package_name'))
									.label('Package'),
							nga.field('package_id', 'reference')
									.targetEntity(admin.getEntity('Packages'))
									.targetField(nga.field('package_type')
											.map(function getpckdes(value, entry) {
												return (entry["package_type.description"]);
											}))
									.label('Package Type'),
						])
						.listActions(['<ma-delete-button label="Remove" entry="entry" entity="entity" size="xs"></ma-delete-button>']),
				nga.field('ADD PACKAGE', 'template')
						.label('')
						.template('<ma-create-button entity-name="comboPackages" class="pull-right" label="ADD PACKAGE" default-values="{ combo_id: entry.values.id }"></ma-create-button>'),
			]);


	return combo;

}