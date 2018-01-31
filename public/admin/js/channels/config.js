import edit_button from '../edit_button.html';
export default function (nga, admin) {
	var channels = admin.getEntity('Channels');

	channels.listView()
			.title('<h4>Channels <i class="fa fa-angle-right" aria-hidden="true"></i> List </h4>')
			.batchActions([])
			.fields([
				nga.field('title', 'string')
						.isDetailLink(true)
						.label('Title'),
				nga.field('channel_number', 'string')
						.label('Number'),
				nga.field('genre_id', 'reference')
						.targetEntity(admin.getEntity('Genres'))
						.targetField(nga.field('description'))
						.label('Genres'),
				nga.field('icon_url', 'file')
						.template('<img src="{{ entry.values.icon_url }}" height="35" width="35" />')
						.cssClasses('hidden-xs')
						.label('Icon'),
				nga.field('packages_channels')
						.cssClasses('hidden')
						.map(function getpckgid(value, entry) {
							var return_object = [];
							for (var i = 0; i < value.length; i++) {
								return_object[i] = value[i].package_id;
							}
							return return_object;
						})
						.label('Packages Channels'),
				nga.field('packages_channels','reference_many')
						.targetEntity(admin.getEntity('Packages'))
						.targetField(nga.field('package_name'))
						.singleApiCall(function (package_id) {
							return { 'package_id[]': package_id };
						})
						.label('Packages'),
				nga.field('description', 'text')
						.cssClasses('hidden-xs')
						.label('Description'),
				nga.field('isavailable', 'boolean')
						.label('Available'),
				nga.field('pin_protected', 'boolean')
						.label('Pin Protected'),
			])
			.sortDir("ASC")
			.sortField("channel_number")
			.filters([
				nga.field('q')
						.label('')
						.template('<div class="input-group"><input type="text" ng-model="value" placeholder="Search" class="form-control"></input><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span></div>')
						.pinned(true)])
			.listActions(['edit'])

			.exportFields([
				channels.listView().fields(),
			]);

	channels.deletionView()
			.title('<h4>Channels <i class="fa fa-angle-right" aria-hidden="true"></i> Remove <span style ="color:red;"> {{ entry.values.title }}')
			.actions(['<ma-back-button entry="entry" entity="entity"></ma-back-button>'])

	channels.creationView()
			.title('<h4>Channels <i class="fa fa-angle-right" aria-hidden="true"></i> Create: Channel</h4>')
			.onSubmitSuccess(['progression', 'notification', '$state', 'entry', 'entity', function(progression, notification, $state, entry, entity) {
				// stop the progress bar
				progression.done();
				// add a notification
				$state.go($state.get('edit'), { entity: entity.name(), id: entry._identifierValue });
				// cancel the default action (redirect to the edition view)
				return false;
			}])
			.onSubmitError(['error', 'form', 'progression', 'notification', function(error, form, progression, notification) {
				// stop the progress bar
				progression.done();
				// add a notification
				//notification.log(`This channel number exists`, { addnCls: 'humane-flatty-error' });
				// cancel the default action (default error messages)
				return false;
			}])
			.fields([
				nga.field('title', 'string')
						.attributes({ placeholder: 'Title' })
						.validation({ required: true })
						.label('Title'),
				nga.field('channel_number', 'string')
						.validation({ required: true })
						.label('Number'),
				nga.field('genre_id', 'reference')
						.targetEntity(admin.getEntity('Genres'))
						.targetField(nga.field('description'))
						.validation({ required: true })
						.attributes({ placeholder: 'Select Genre' })
						.label('Genre'),
				nga.field('description', 'text')
						.attributes({ placeholder: 'Description' })
						.validation({ required: true })
						.label('Description'),
				nga.field('isavailable','boolean')
						.attributes({ placeholder: 'Is Available' })
						.validation({ required: true })
						.label('Is Available'),
				nga.field('pin_protected', 'boolean')
						.validation({ required: true })
						.label('Pin Protected'),
				nga.field('icon_url', 'file')
						.uploadInformation({ 'url': '/file-upload/single-file/channels/icon_url', 'apifilename': 'result'})
						.template('<div class="row">'+
								'<div class="col-xs-12 col-sm-1"><img src="{{ entry.values.icon_url }}" height="40" width="40" /></div>'+
								'<div class="col-xs-12 col-sm-8"><ma-file-field field="field" value="entry.values.icon_url"></ma-file-field></div>'+
								'</div>'+
								'<div class="row"><small id="emailHelp" class="form-text text-muted">240x240 px</small></div>')
						.validation({
							validator: function(value) {
								if (value == null) {
									throw new Error('Please, choose icon');
								}
							}
						})
						.label('Icon *'),
				nga.field('template')
						.label('')
						.template(edit_button),

			]);

	channels.editionView()
			.title('<h4>Channels <i class="fa fa-angle-right" aria-hidden="true"></i> Edit: {{ entry.values.title }}</h4>')
			.actions(['list', '<ma-delete-button label="Remove" entry="entry" entity="entity"></ma-delete-button>'])
			.fields([
				channels.creationView().fields(),
				nga.field('ChannelStreams', 'referenced_list')
						.label('Channel Streams')
						.targetEntity(admin.getEntity('ChannelStreams'))
						.targetReferenceField('channel_id')
						.targetFields([
							nga.field('stream_url')
									.map(function truncate(value) {
										if (!value) {
											return '';
										}
										return value.length > 25 ? value.substr(0, 25) + '...' : value;
									})
									.label('Stream Url'),
							nga.field('stream_source_id', 'reference')
									.targetEntity(admin.getEntity('ChannelStreamSources'))
									.targetField(nga.field('stream_source'))
									.cssClasses('hidden-xs')
									.label('Stream Source'),
							nga.field('stream_format')
									.cssClasses('hidden-xs')
									.label('Stream Format'),
							nga.field('token', 'boolean')
									.label('Token'),
							nga.field('encryption', 'boolean')
									.cssClasses('hidden-xs')
									.label('Encryption'),
							nga.field('stream_mode', 'string')
									.cssClasses('hidden-xs')
									.label('Stream Mode'),

						])
						.listActions(['edit', 'delete']),
				nga.field('template')
						.label('')
						.template('<ma-create-button entity-name="ChannelStreams" class="pull-right" label="ADD STREAM" default-values="{ channel_id: entry.values.id }"></ma-create-button>'),

			]);

	return channels;

}
