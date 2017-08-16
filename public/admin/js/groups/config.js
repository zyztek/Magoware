import edit_button from '../edit_button.html';

export default function (nga, admin) {
	var groups = admin.getEntity('Groups');
	groups.listView()
			.title('<h4>User Groups <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
			.actions(['create'])
			.batchActions([])
			.fields([
				nga.field('name', 'string')
						.label('Name'),
				nga.field('code', 'string')
						.label('Role'),
				nga.field('isavailable', 'boolean')
						.validation({ required: true })
						.label('Available'),
			])
			.listActions(['edit'])

	groups.creationView()
			.onSubmitSuccess(['progression', 'notification', '$state', 'entry', 'entity', function(progression, notification, $state, entry, entity) {
				progression.done();
				$state.go($state.get('edit'), { entity: entity.name(), id: entry._identifierValue });
				return false;
			}])
			.title('<h4>User groups <i class="fa fa-angle-right" aria-hidden="true"></i> Create: User groups</h4>')
			.fields([
				nga.field('name', 'string')
						.attributes({ placeholder: 'Group name' })
						.validation({ required: true })
						.label('Group name'),
				nga.field('code')
						.attributes({ placeholder: 'Group code' })
						.validation({ required: true })
						.label('Group code'),
				nga.field('isavailable', 'boolean')
						.attributes({ placeholder: 'Is Available' })
						.validation({ required: true })
						.label('Is Available'),
				nga.field('template')
						.label('')
						.template(edit_button),
			]);

	groups.editionView()
			.title('<h4>User group <i class="fa fa-angle-right" aria-hidden="true"></i> Edit: {{ entry.values.description }}</h4>')
			.actions(['list'])
			.fields([
				groups.listView().fields(),
				nga.field('template')
						.label('')
						.template(edit_button),
				nga.field('', 'referenced_list')
						.label('User permissions')
						.targetEntity(admin.getEntity('Grouprights'))
						.targetReferenceField('group_id')
						.targetFields([
							nga.field('api_group_name', 'string')
									.label('Api Group'),
							nga.field('description', 'string')
									.label('Description'),
							nga.field('grouprights.id', 'template')
									.label('Permitions ')
									.template('<approve-review size="xs" review="entry"></approve-review>'),
						]),

			])


	return groups;

}