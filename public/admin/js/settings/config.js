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
				    '<small id="emailHelp" class="form-text text-muted">If there is no activity for this time then application will return to main menu. Default value 3 hr</small>'+
				  '</div>')
				.label('Activity Time Out'),
			nga.field('log_event_interval' ,'number')
				.attributes({ placeholder: 'Log event interval' })
				.template('<div class="form-group">'+
				    '<ma-input-field field="field" value="entry.values.log_event_interval"></ma-input-field>'+
				    '<small id="emailHelp" class="form-text text-muted">Frequency to send audience logs.</small>'+
				  '</div>')
				.label('Log event interval'),

			nga.field('channel_log_time' ,'number')
				.attributes({ placeholder: 'Channel log time' })
				.template('<div class="form-group">'+
				    '<ma-input-field field="field" value="entry.values.channel_log_time"></ma-input-field>'+
				    '<small id="emailHelp" class="form-text text-muted">Timeout to define a channel as not able to play.</small>'+
				  '</div>')
				.label('Channel log time'),

			nga.field('vod_subset_nr' ,'number')
				.template('<div class="form-group">'+
					'<ma-input-field field="field" value="entry.values.vod_subset_nr"></ma-input-field>'+
					'<small id="emailHelp" class="form-text text-muted">Number of movies sent in each vod request</small>'+
					'</div>')
				.label('Vod movies / request'),

			nga.field('analytics_id' ,'string')
				.attributes({ placeholder: 'Analytics ID' })
				.template('<div class="form-group">'+
				    '<ma-input-field field="field" value="entry.values.analytics_id"></ma-input-field>'+
				    '<small id="emailHelp" class="form-text text-muted">Google analytics ID to monitor audience and system logs.</small>'+
				  '</div>')
				.label('Analytics ID'),


            nga.field('box_logo_url', 'file')
                .label('Box Logo')
                .template('<div class="row">'+
                    '<div class="col-xs-12 col-sm-1"><img src="{{ entry.values.box_logo_url }}" height="40" width="40" /></div>'+
                    '<div class="col-xs-12 col-sm-8"><ma-file-field field="field" value="entry.values.box_logo_url"></ma-file-field></div>'+
                    '</div>'+
                    '<div class="row"><small id="emailHelp" class="form-text text-muted">1988x318 px,not larger than 600 KB</small></div>')
                .uploadInformation({ 'url': '/file-upload/single-file/settings/box_logo_url','apifilename': 'result'})
                .validation({ required: true, validator: function() {
                        var box_logo_url = document.getElementById('box_logo_url');
                        if (box_logo_url.value.length > 0) {
                            if(box_logo_url.files[0].size > 614400 ){
                                throw new Error('Your Box Logo is too Big, not larger than 600 KB');
                            }
                        }
                    }
                }),

            nga.field('box_background_url', 'file')
                .label('Box Background')
                .template('<div class="row">'+
                    '<div class="col-xs-12 col-sm-1"><img src="{{ entry.values.box_background_url }}" height="40" width="40" /></div>'+
                    '<div class="col-xs-12 col-sm-8"><ma-file-field field="field" value="entry.values.box_background_url"></ma-file-field></div>'+
                    '</div>'+
                    '<div class="row"><small id="emailHelp" class="form-text text-muted">1920x1080 px, not larger than 1.3 MB</small></div>')
                .uploadInformation({ 'url': '/file-upload/single-file/settings/box_background_url','apifilename': 'result'})
                .validation({ required: true, validator: function() {
                        var box_background_url = document.getElementById('box_background_url');
                        if (box_background_url.value.length > 0) {
                            if(box_background_url.files[0].size > 1572864 ){
                                throw new Error('Your Box Background is too Big, not larger than 1.3 MB');
                            }
                        }
                    }
                }),

            nga.field('mobile_background_url', 'file')
                .label('Mobile Background')
                .template('<div class="row">'+
                    '<div class="col-xs-12 col-sm-1"><img src="{{ entry.values.mobile_background_url }}" height="40" width="40" /></div>'+
                    '<div class="col-xs-12 col-sm-8"><ma-file-field field="field" value="entry.values.mobile_background_url"></ma-file-field></div>'+
                    '</div>'+
                    '<div class="row"><small id="emailHelp" class="form-text text-muted">566x318 px, not larger than 1 MB</small></div>')
                .uploadInformation({ 'url': '/file-upload/single-file/settings/mobile_background_url','apifilename': 'result'})
                .validation({ required: true, validator: function() {
                        var mobile_background_url = document.getElementById('mobile_background_url');
                        if (mobile_background_url.value.length > 0) {
                            if(mobile_background_url.files[0].size > 1048576 ){
                                throw new Error('Your Mobile Background is too Big, not larger than 1 MB');
                            }
                        }
                    }
                }),

            nga.field('mobile_logo_url', 'file')
                .label('Mobile Logo')
                .template('<div class="row">'+
                    '<div class="col-xs-12 col-sm-1"><img src="{{ entry.values.mobile_logo_url }}" height="40" width="40" /></div>'+
                    '<div class="col-xs-12 col-sm-8"><ma-file-field field="field" value="entry.values.mobile_logo_url"></ma-file-field></div>'+
                    '</div>'+
                    '<div class="row"><small id="emailHelp" class="form-text text-muted">240x38 px, not larger than 600 KB</small></div>')
                .uploadInformation({ 'url': '/file-upload/single-file/settings/mobile_logo_url','apifilename': 'result'})
                .validation({ required: true, validator: function() {
                        var mobile_logo_url = document.getElementById('mobile_logo_url');
                        if (mobile_logo_url.value.length > 0) {
                            if(mobile_logo_url.files[0].size > 614400 ){
                                throw new Error('Your Mobile Logo is too Big, not larger than 600 KB');
                            }
                        }
                    }
                }),

            nga.field('vod_background_url', 'file')
                .label('VOD Background')
                .template('<div class="row">'+
                    '<div class="col-xs-12 col-sm-1"><img src="{{ entry.values.vod_background_url }}" height="40" width="40" /></div>'+
                    '<div class="col-xs-12 col-sm-8"><ma-file-field field="field" value="entry.values.vod_background_url"></ma-file-field></div>'+
                    '</div>'+
                    '<div class="row"><small id="emailHelp" class="form-text text-muted">1920x1080 px, not larger than 1 MB</small></div>')
                .uploadInformation({ 'url': '/file-upload/single-file/settings/vod_background_url','apifilename': 'result'})
                .validation({ required: true, validator: function() {
                        var vod_background_url = document.getElementById('vod_background_url');
                        if (vod_background_url.value.length > 0) {
                            if(vod_background_url.files[0].size > 1048576 ){
                                throw new Error('Your VOD Background is too Big, not larger than 1 MB');
                            }
                        }
                    }
                }),






			nga.field('locale', 'string')
				.validation({ required: true })
				.label('Locale')
				.template('<div class="form-group">'+
						'<ma-input-field field="field" value="entry.values.locale"></ma-input-field>'+
						'<small id="emailHelp" class="form-text text-muted">User interface language (not in use).</small>'+
						'</div>'),
			nga.field('help_page', 'string')
					.validation({ required: true })
					.label('Help and Support website')
				.template('<div class="form-group">'+
						'<ma-input-field field="field" value="entry.values.help_page"></ma-input-field>'+
						'<small id="emailHelp" class="form-text text-muted">Configure application help page (By default /help_and_support)</small>'+
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
				.validation({ required: true, minlength: 16, maxlength: 16 })
				.label('New Encryption Key')
				.template('<div class="form-group">'+
						'<ma-input-field field="field" value="entry.values.new_encryption_key"></ma-input-field>'+
						'<small id="emailHelp" class="form-text text-muted">Key used to encrypt/decrypt token. 16 characters long</small>'+
						'</div>'),
            nga.field('key_transition', 'boolean')
                .validation({ required: true })
                .label('Key Transition'),
			nga.field('firebase_key', 'text')
					.validation({ required: true })
					.label('Firebase key'),
			nga.field('akamai_token_key', 'string')
                .label('Akamai  token key'),
            nga.field('flussonic_token_key', 'string')
                .label('Flussonic token key'),
            nga.field('allow_guest_login','boolean')
                .label('')
				.template('<form ng-app="myApp" ng-controller="checkboxController">'+
					'<div class="form-check">'+
                    	'<label class="toggle">'+
                    		'<input type="checkbox" name="toggle" ng-model="checkboxModel.value1"'+
                    		'ng-true-value="true" ng-false-value="false"> <span class="label-text">Allow Guest Login</span>'+
                    	'</label>'+
                    '</div>'+
                    '</form>'),
            nga.field('template')
                .label('')
                .template(edit_button),

            //HIDDEN FROM UI
			nga.field('updatedAt', 'datetime')
                .cssClasses('hidden')
                .editable(false)
                .label(''),
			nga.field('menulastchange', 'datetime')
                .cssClasses('hidden')
				.editable(false)
				.label(''),
			nga.field('updatemenulastchange', 'boolean')
                .cssClasses('hidden')
				.editable(true)
				.validation({ required: false })
				.label(''),
			nga.field('livetvlastchange', 'datetime')
                .cssClasses('hidden')
				.editable(false)
				.label(''),
			nga.field('updatelivetvtimestamp', 'boolean')
                .cssClasses('hidden')
					.editable(true)
					.validation({ required: false })
					.label(''),
			nga.field('vodlastchange', 'datetime')
                .cssClasses('hidden')
					.editable(false)
					.label(''),
			nga.field('updatevodtimestamp', 'boolean')
                .cssClasses('hidden')
					.editable(true)
					.validation({ required: false })
					.label(''),
			nga.field('googlegcmapi')
				.template('<div class="form-group" style="display: none;">'+
				    '<ma-input-field field="field" value="entry.values.googlegcmapi"></ma-input-field>'+
				    '<small id="emailHelp" class="form-text text-muted">Google GCM API code for push messages to android devices.</small>'+
				  '</div>')
				.label(''),
			nga.field('applekeyid')
				.template('<div class="form-group" style="display: none;">'+
				    '<ma-input-field field="field" value="entry.values.applekeyid"></ma-input-field>'+
				    '<small id="emailHelp" class="form-text text-muted">Apple key id for push messages to apple devices.</small>'+
				  '</div>')
				.label(''),
			nga.field('appleteamid')
				.template('<div class="form-group" style="display: none;">'+
				    '<ma-input-field field="field" value="entry.values.appleteamid"></ma-input-field>'+
				    '<small id="emailHelp" class="form-text text-muted">Apple team id for push messages to apple devices.</small>'+
				  '</div>')
				.label(''),
			nga.field('applecertificate', 'text')
				.template('<div class="form-group" style="display: none;">'+
				    '<ma-text-field field="field" value="entry.values.applecertificate"></ma-text-field>'+
				    '<small id="emailHelp" class="form-text text-muted">Apple team id for push messages to apple devices.</small>'+
				  '</div>')
				.label(''),
			//./HIDDEN FROM UI
		]);

	settings.editionView()
		.title('<h4><i class="fa fa-angle-right" aria-hidden="true"></i> Company Settings</h4>')
		.actions([''])
			.onSubmitSuccess(['progression', 'notification', '$state', 'entry', 'entity', function(progression, notification, $state, entry, entity) {
				progression.done(); // stop the progress bar
				notification.log(`Element #${entry._identifierValue} successfully edited.`, { addnCls: 'humane-flatty-success' }); // add a notification
				// redirect to the list view
				$state.go($state.current, {}, {reload : true}); // cancel the default action (redirect to the edition view)
				return false;
			}])
		.fields([
            settings.listView().fields(),
		]);

	return settings;
	
}