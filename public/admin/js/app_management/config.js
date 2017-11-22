import edit_button from '../edit_button.html';

export default function (nga, admin) {
	var app_management = admin.getEntity('appmanagement');
	app_management.listView()
		.title('<h4>App Management <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
		.batchActions([])
		.fields([
			nga.field('appid', 'string')
				.label('App ID'),
			nga.field('app_version')
				.cssClasses('hidden-xs')
				.label('App Version'),
			nga.field('title')
				.cssClasses('hidden-xs')
				.label('Title'),
			nga.field('description')
				.label('Description'),
			nga.field('url')
				.label('Url'),
			nga.field('upgrade_min_api', 'string')
				.label('Min Upgrade Api'),
			nga.field('upgrade_min_app_version', 'string')
				.label('Min Upgrade App Version'),
			nga.field('beta_version')
				.map(function app(value) {
						if (value === true) {
								return 'Beta';
						} else if (value === false) {
								return 'Live';
						}
				})
				.label('Beta Version'),
			nga.field('isavailable' ,'boolean')
				.label('Is Available'),
		])
		.listActions(['edit'])

		
        .exportFields([
         app_management.listView().fields(),
        ]);


	app_management.creationView()
		.title('<h4>App Management <i class="fa fa-angle-right" aria-hidden="true"></i> Create: APP</h4>')
        .fields([
        	nga.field('appid', 'string')
        		 .attributes({ placeholder: 'App ID' })
                .validation({ required: true })
				.label('App ID'),
			nga.field('app_version')
				.attributes({ placeholder: 'App Version' })
                .validation({ required: true })
				.label('App Version'),
			nga.field('title')
				.attributes({ placeholder: 'Title' })
                .validation({ required: true })
				.label('Title'),
			nga.field('description')
				.attributes({ placeholder: 'Description' })
                .validation({ required: true })
				.label('Description'),
	        nga.field('url', 'file')
                .uploadInformation({ 'url': '/file-upload/single-file/apk/url','apifilename': 'result'})
                .template('<div class="row">'+
						'<div class="col-xs-12 col-sm-1"><img src="{{ entry.values.url }}" height="40" width="40" /></div>'+
                        '<div class="col-xs-12 col-sm-8"><ma-file-field field="field" value="entry.values.url"></ma-file-field></div>'+
                        '</div>'+
						'<div class="row"><small id="emailHelp" class="form-text text-muted">Expected file extension: apk.</small></div>'+
						'<div class="row"><small id="emailHelp" class="form-text text-muted">Expected filename format: x_yz.apk</small></div>')
                .validation({
				    validator: function(value) {
				        if (value == null) {
				            throw new Error('Please, choose Url');
				        }
				    }
				}),
			nga.field('upgrade_min_api', 'string')
				.attributes({ placeholder: 'Upgrade Min API' })
                .validation({ required: true })
				.label('Min Upgrade Api'),
			nga.field('upgrade_min_app_version', 'string')
				.attributes({ placeholder: 'Upgrade Min App Version' })
                .validation({ required: true })
				.label('Min Upgrade App Version'),
			nga.field('beta_version', 'choice')
				.validation({ required: true })
				.choices([
                     { value:' 0', label:' Live' },
                     { value:' 1',  label:' Beta' },
                 ])
				.label('Beta Version'),
			nga.field('isavailable' ,'boolean')
				.validation({ required: true })
				.label('Is Available'),
            nga.field('template')
            	.label('')
            	.template(edit_button),  
        ]);	

    app_management.editionView()
    	.title('<h4>App Management <i class="fa fa-angle-right" aria-hidden="true"></i> Edit: {{ entry.values.title }}</h4>')
    	.actions(['list'])
        .fields([
            app_management.creationView().fields(),
        ]);	
	    

	return app_management;
	
}
