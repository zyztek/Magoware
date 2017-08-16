import edit_button from '../edit_button.html';
//import set from './setting.html';

export default function (nga, admin) {
	var settings = admin.getEntity('Settings');
	settings.listView()
		.batchActions([])
		.fields([
			nga.field('email_username')
				.validation({ required: true })
				.label('Email Username')
				.template('<div class="form-group">'+
				    '<ma-input-field field="field" value="entry.values.email_username"></ma-input-field>'+
				    '<small id="emailHelp" class="form-text text-muted">Username for outgoing smtp mail server.</small>'+
				  '</div>')
				.attributes({ placeholder: 'Username' }),
			nga.field('email_password', 'password')
				.validation({ required: true })
				.label('Email Password')
				.template('<div class="form-group">'+
				    '<ma-input-field field="field" type="password" value="entry.values.email_password"></ma-input-field>'+
				    '<small id="emailHelp" class="form-text text-muted">Passowrd for outgoing smtp mail server.</small>'+
				  '</div>')
				.attributes({ placeholder: 'Password' }),
			nga.field('email_address')
				.validation({ required: true })
				.label('Email Address')
				.template('<div class="form-group">'+
				    '<ma-input-field field="field" value="entry.values.email_address"></ma-input-field>'+
				    '<small id="emailHelp" class="form-text text-muted">Email address for outboing smtp mail server.</small>'+
				  '</div>')
				.attributes({ placeholder: 'Address' }),
			nga.field('activity_timeout' ,'number')
				.attributes({ placeholder: 'Activity Timeout' })
				.template('<div class="form-group">'+
				    '<ma-input-field field="field" value="entry.values.activity_timeout"></ma-input-field>'+
				    '<small id="emailHelp" class="form-text text-muted">If there is no activity for this time then application will return to main menu.</small>'+
				  '</div>')
				.label('Activity Time Out'),
			nga.field('log_event_interval' ,'number')
				.attributes({ placeholder: 'Log event internel' })
				.template('<div class="form-group">'+
				    '<ma-input-field field="field" value="entry.values.log_event_interval"></ma-input-field>'+
				    '<small id="emailHelp" class="form-text text-muted">Frequency to send audience logs.</small>'+
				  '</div>')
				.label('Log event internel'),

			nga.field('channel_log_time' ,'number')
				.attributes({ placeholder: 'Channel log time' })
				.template('<div class="form-group">'+
				    '<ma-input-field field="field" value="entry.values.channel_log_time"></ma-input-field>'+
				    '<small id="emailHelp" class="form-text text-muted">Timeout to define a channel as not able to play.</small>'+
				  '</div>')
				.label('Channel log time'),
			nga.field('analytics_id' ,'string')
				.attributes({ placeholder: 'Analytics ID' })
				.template('<div class="form-group">'+
				    '<ma-input-field field="field" value="entry.values.analytics_id"></ma-input-field>'+
				    '<small id="emailHelp" class="form-text text-muted">Google analytics ID to monitor audience and system logs.</small>'+
				  '</div>')
				.label('Analytics ID'),
			nga.field('box_logo_url', 'file')
				.validation({ required: true })
				.label('Box Logo')
                .template('<div class="row">'+
                          '<div class="col-xs-12 col-sm-1"><img src="{{ entry.values.box_logo_url }}" height="40" width="40" /></div>'+
                          '<div class="col-xs-12 col-sm-8"><ma-file-field field="field" value="entry.values.box_logo_url"></ma-file-field></div>'+
                        '</div>')
				.uploadInformation({ 'url': '/file-upload/single-file/settings/box_logo_url','apifilename': 'result'}),
			nga.field('box_background_url', 'file')
				.validation({ required: true })
				.label('Box Background')
                .template('<div class="row">'+
                          '<div class="col-xs-12 col-sm-1"><img src="{{ entry.values.box_background_url }}" height="40" width="40" /></div>'+
                          '<div class="col-xs-12 col-sm-8"><ma-file-field field="field" value="entry.values.box_background_url"></ma-file-field></div>'+
                        '</div>')
				.uploadInformation({ 'url': '/file-upload/single-file/settings/box_background_url','apifilename': 'result'}),
			nga.field('mobile_background_url', 'file')
				.validation({ required: true })
				.label('Mobile Background')
                .template('<div class="row">'+
                          '<div class="col-xs-12 col-sm-1"><img src="{{ entry.values.mobile_background_url }}" height="40" width="40" /></div>'+
                          '<div class="col-xs-12 col-sm-8"><ma-file-field field="field" value="entry.values.mobile_background_url"></ma-file-field></div>'+
                        '</div>')
				.uploadInformation({ 'url': '/file-upload/single-file/settings/mobile_background_url','apifilename': 'result'}),
			nga.field('mobile_logo_url', 'file')
				.validation({ required: true })
				.label('Mobile Logo')
                .template('<div class="row">'+
                          '<div class="col-xs-12 col-sm-1"><img src="{{ entry.values.mobile_logo_url }}" height="40" width="40" /></div>'+
                          '<div class="col-xs-12 col-sm-8"><ma-file-field field="field" value="entry.values.mobile_logo_url"></ma-file-field></div>'+
                        '</div>')
				.uploadInformation({ 'url': '/file-upload/single-file/settings/mobile_logo_url','apifilename': 'result'}),
			nga.field('vod_background_url', 'file')
				.validation({ required: true })
				.label('VOD Background')
                .template('<div class="row">'+
                          '<div class="col-xs-12 col-sm-1"><img src="{{ entry.values.vod_background_url }}" height="40" width="40" /></div>'+
                          '<div class="col-xs-12 col-sm-8"><ma-file-field field="field" value="entry.values.vod_background_url"></ma-file-field></div>'+
                        '</div>')
				.uploadInformation({ 'url': '/file-upload/single-file/settings/vod_background_url','apifilename': 'result'}),
			nga.field('locale', 'string')
				.validation({ required: true })
				.label('Locale')
				.template('<div class="form-group">'+
						'<ma-input-field field="field" value="entry.values.locale"></ma-input-field>'+
						'<small id="emailHelp" class="form-text text-muted">User interface language (not in use).</small>'+
						'</div>'),
			nga.field('assets_url', 'string')
				.validation({ required: true })
				.label('Assets URL')
				.template('<div class="form-group">'+
				    '<ma-input-field field="field" value="entry.values.assets_url"></ma-input-field>'+
				    '<small id="emailHelp" class="form-text text-muted">URL to provide images through a CDN.</small>'+
				  '</div>')
				.attributes({ placeholder: 'Assets URL' }),
			nga.field('new_encryption_key')
				.validation({ required: true })
				.label('New Encryption Key')
				.template('<div class="form-group">'+
						'<ma-input-field field="field" value="entry.values.new_encryption_key"></ma-input-field>'+
						'<small id="emailHelp" class="form-text text-muted">Key used to encrypt/decrypt token</small>'+
						'</div>'),
			nga.field('key_transition', 'boolean')
				.validation({ required: true })
				.label('Key Transition'),

			nga.field('menulastchange', 'datetime')
				.editable(false)
				.label('Menu Last Change'),
			nga.field('updatemenulastchange', 'boolean')
				.editable(true)
				.validation({ required: true })
				.label('Update Menu Timestamp'),
			nga.field('livetvlastchange', 'datetime')
				.editable(false)
				.label('Live TV Last Change'),
			nga.field('updatelivetvtimestamp', 'boolean')
					.editable(true)
					.validation({ required: true })
					.label('Update Live TV Timestamp'),
			nga.field('vodlastchange', 'datetime')
					.editable(false)
					.label('VOD Last Change'),
			nga.field('updatevodtimestamp', 'boolean')
					.editable(true)
					.validation({ required: true })
					.label('Update VOD Timestamp'),


			nga.field('googlegcmapi')
				.template('<div class="form-group">'+
				    '<ma-input-field field="field" value="entry.values.googlegcmapi"></ma-input-field>'+
				    '<small id="emailHelp" class="form-text text-muted">Google GCM API code for push messages to android devices.</small>'+
				  '</div>')
				.label('googlegcmapi'),
			nga.field('applekeyid')
				.template('<div class="form-group">'+
				    '<ma-input-field field="field" value="entry.values.applekeyid"></ma-input-field>'+
				    '<small id="emailHelp" class="form-text text-muted">Apple key id for push messages to apple devices.</small>'+
				  '</div>')
				.label('applekeyid'),
			nga.field('appleteamid')
				.template('<div class="form-group">'+
				    '<ma-input-field field="field" value="entry.values.appleteamid"></ma-input-field>'+
				    '<small id="emailHelp" class="form-text text-muted">Apple team id for push messages to apple devices.</small>'+
				  '</div>')
				.label('appleteamid'),
			nga.field('applecertificate', 'text')
				.template('<div class="form-group">'+
				    '<ma-text-field field="field" value="entry.values.applecertificate"></ma-text-field>'+
				    '<small id="emailHelp" class="form-text text-muted">Apple team id for push messages to apple devices.</small>'+
				  '</div>')
				.label('applecertificate'),
			nga.field('updatedAt', 'datetime')
					.editable(false)
					.label('Last Updated'),
		])

	settings.editionView()
		.title('<h4><i class="fa fa-angle-right" aria-hidden="true"></i> Company Settings</h4>')
		.actions([''])
		.onSubmitSuccess(['progression', 'notification', '$state', 'entry', 'entity', function(progression, notification, $state, entry, entity) {
			// stop the progress bar
			progression.done();
			// add a notification
			notification.log(`Element #${entry._identifierValue} successfully edited.`, { addnCls: 'humane-flatty-success' });
			// redirect to the list view
			$state.go($state.get('edit'), { entity: entity.name() });
			// cancel the default action (redirect to the edition view)
			return false;
		}])
		.fields([
            settings.listView().fields(),
            nga.field('template')
            	.label('')
            	.template(edit_button),
        ])

	return settings;
	
}