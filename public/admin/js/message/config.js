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
				.label('Created'),
		])
        .listActions(['edit'])
        .exportFields([
         message.listView().fields(),
        ]);


	message.creationView()
        .title('<h4>Messages <i class="fa fa-angle-right" aria-hidden="true"></i> Create: Messages</h4>')         
        .fields([
			nga.field('type', 'choice')
				.choices(function (entry) {
					var types = [
						    { value: 'one', label: 'One User' },
    						{ value: 'all', label: 'All User' }
					]
					return types;
				})
			    .label('User Type'),
			nga.field('username', 'reference')
				.targetEntity(admin.getEntity('LoginData'))
                .targetField(nga.field('username')
                .map(function (value) {
                	var user = [];
                		for (var i = 0; i < value.length; i++) {
                			user[i] = value[i].username;
							return value;
                		}
                }))
				.perPage(-1),
			nga.field('toandroidsmartphone', 'boolean')
					.validation({ required: true })
					.label('Android Smartphone'),
			nga.field('toios', 'boolean')
					.validation({ required: true })
					.label('IOS'),
			nga.field('toandroidbox', 'boolean')
					.validation({ required: true })
					.label('Android Box'),
			nga.field('timetolive', 'number')
					.attributes({ placeholder: 'ttl' })
					.validation({ required: true })
					.label('Time to live in sec'),
			nga.field('message', 'text')
				.attributes({ placeholder: 'Message' })
				.validation({ required: true })
				.label('Messages'),
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
        ]); 

	return message;
	
}