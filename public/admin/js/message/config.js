import edit_button from '../edit_button.html';
import filter_genre_btn from '../filter_genre_btn.html';

export default function (nga, admin) {
	var message = admin.getEntity('messages');
	message.listView()
			.batchActions(['sendmessage', '<my-custom-directive selection="selection"></my-custom-directive>'])
			.title('<h4>Messages <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')

			.fields([
				nga.field('username')
						.label('Username'),
				nga.field('title')
						.label('Title'),
				nga.field('message')
						.map(function truncate(value) {
							if (!value) {
								return '';
							}
							return value.length > 14 ? value.substr(0, 14) + '...' : value;
						})
						.label('Messages'),
				nga.field('action')
						.label('Action'),
				nga.field('createdAt', 'datetime')
						.label('Created at'),
			])
			.listActions(['edit'])
			.exportFields([
				message.listView().fields(),
			]);


	message.creationView()
			.title('<h4>Messages <i class="fa fa-angle-right" aria-hidden="true"></i> Create: Messages</h4>')
			.actions(['list'])
			.onSubmitSuccess(['progression', 'notification', '$state', 'entry', 'entity', function(progression, notification, $state, entry, entity) {
				// redirect to the list view
				$state.go($state.current, {}, {reload : true})
						.then($state.go($state.get('list'), { entity: entity.name() })); // cancel the default action (redirect to the edition view)
			}])
			.fields([
				nga.field('type', 'choice')
						.choices(function(entry) {
							var types = [
								{ value: 'one', label: 'One User' },
								{ value: 'all', label: 'All User' }
							]
							return types;
						})
						.label('User Type'),
				nga.field('username', 'reference')
						.targetEntity(admin.getEntity('LoginData'))
						.targetField(nga.field('username'))
						.attributes({ placeholder: 'Select Account' })
						.remoteComplete(true, {
							refreshDelay: 300,
							// populate choices from the response of GET /posts?q=XXX
							searchQuery: function(search) { return { q: search }; }
						})
						.perPage(10) // limit the number of results to 10
						.label('Username'),
				nga.field('appid', 'choices')
						.attributes({ placeholder: 'Send to device type:' })
						.choices([
							{ value: 1, label: 'Android Set Top Box' },
							{ value: 2, label: 'Android Smart Phone' },
							{ value: 3, label: 'IOS' },
							{ value: 4, label: 'Android Smart TV' },
							{ value: 5, label: 'Samsung Smart TV' },
							{ value: 6, label: 'Apple TV' }
						])
						.validation({required: true})
						.label('Applications IDs'),
				nga.field('timetolive', 'number')
						.attributes({ placeholder: 'ttl' })
						.validation({ required: true })
						.label('Time to live in sec'),
				nga.field('title', 'string')
						.attributes({ placeholder: 'Info message' })
						.validation({ required: true })
						.label('Title'),
				nga.field('message', 'text')
						.attributes({ placeholder: 'Message' })
						.validation({ required: true })
						.label('Message'),
				nga.field('sendtoactivedevices', 'boolean')
						.validation({ required: true })
						.defaultValue(true)
						.label('Send only to active devices'),
				nga.field('template')
						.label('')
						.template(edit_button),
			]);

	message.editionView()
			.title('<h4>Messages <i class="fa fa-angle-right" aria-hidden="true"></i></h4>')
			.actions(['list'])
			.fields([
				nga.field('username')
						.validation({ required: true })
						.label('Username'),
				nga.field('googleappid')
						.attributes({ placeholder: 'Google app id' })
						.label('Google App ID'),
				nga.field('title')
						.label('Title'),
				nga.field('action')
						.label('Action'),
				nga.field('message', 'text')
						.attributes({ placeholder: 'Message' })
						.validation({ required: true })
						.label('Messages'),
				nga.field('template')
						.label('')
						.template(edit_button),
			]);

	return message;

}