import edit_button from '../edit_button.html';

export default function (nga, admin) {
	var user = admin.getEntity('Users');
	user.listView()
			.title('<h4>Users <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
			.batchActions([])
			.fields([
				nga.field('group_id', 'reference')
						.targetEntity(admin.getEntity('Groups'))
						.targetField(nga.field('name'))
						.label('Group'),
				nga.field('username', 'string')
						.label('Username'),
				nga.field('email', 'email')
						.cssClasses('hidden-xs')
						.label('Email'),
				nga.field('telephone', 'string')
						.cssClasses('hidden-xs')
						.label('Telephone'),
				nga.field('isavailable','boolean')
						.label('Is Available'),
			])
			.listActions(['edit'])
			.exportFields([
				user.listView().fields(),
			]);


	user.creationView()
			.title('<h4>Users <i class="fa fa-angle-right" aria-hidden="true"></i> Create: User </h4>')
			.fields([
				nga.field('group_id', 'reference')
						.targetEntity(admin.getEntity('Groups'))
						.targetField(nga.field('name'))
						.validation({ required: true })
						.attributes({ placeholder: 'Select Group' })
						.label('Group'),
				nga.field('username', 'string')
						.attributes({ placeholder: 'Username must be at least 3 character long' })
						.validation({ required: true, minlength: 3 })
						.label('Username'),
				nga.field('password', 'password')
						.attributes({ placeholder: 'Password must be at least 4 character long' })
						.validation({ required: true, minlength: 4})
						.label('Password'),
				nga.field('email', 'email')
						.attributes({ placeholder: 'Email' })
						.validation({ required: true })
						.label('Email'),
				nga.field('telephone', 'string')
						.attributes({ placeholder: 'Telephone' })
						.validation({ required: true })
						.label('Telephone'),
				nga.field('isavailable', 'boolean')
						.validation({ required: true })
						.label('Is Available'),
				nga.field('template')
						.label('')
						.template(edit_button),
			])

	user.editionView()
			.title('<h4>Users <i class="fa fa-angle-right" aria-hidden="true"></i> Edit: {{ entry.values.username }}</h4>')
			.actions(['list'])
			.fields([
				user.creationView().fields(),
			]);

	return user;

}