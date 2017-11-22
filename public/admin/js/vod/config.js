import edit_button from '../edit_button.html';
//import foto from '../foto.html';

export default function (nga, admin) {
	var vod = admin.getEntity('Vods');
	vod.listView()
		.title('<h4>Vods <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
		.batchActions([])
		.fields([
            nga.field('title', 'string')
                .label('Title'),
            nga.field('category_id', 'reference')
                .targetEntity(admin.getEntity('VodCategories'))
                .targetField(nga.field('name'))
                .label('Category'),
            nga.field('package_id', 'reference')
                .targetEntity(admin.getEntity('Packages'))
				.permanentFilters({ package_type_id: [3,4] })
                .targetField(nga.field('package_name'))
                .cssClasses('hidden-xs')
                .label('Package'),
            nga.field('duration', 'number')
                .cssClasses('hidden-xs')
                .label('Duration'),
			nga.field('icon_url', 'file')
				.template('<img src="{{ entry.values.icon_url }}" height="35" width="35" />')
				.cssClasses('hidden-xs')
				.label('Icon'),
			nga.field('isavailable', 'boolean')
				.cssClasses('hidden-xs')
				.label('Available'),
		])
		.sortDir("DESC")
        .sortField("year")
		.filters([
          nga.field('q')
              .label('')
              .template('<div class="input-group"><input type="text" ng-model="value" placeholder="Search" class="form-control"></input><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span></div>')
              .pinned(true)])
		.listActions(['edit'])
        .exportFields([
         vod.listView().fields(),
        ]);

    	vod.deletionView()
		.title('<h4>Vods <i class="fa fa-angle-right" aria-hidden="true"></i> Remove <span style ="color:red;"> {{ entry.values.title }}')
		.actions(['<ma-back-button entry="entry" entity="entity"></ma-back-button>'])

	vod.creationView()
		.title('<h4>Vods <i class="fa fa-angle-right" aria-hidden="true"></i> Create: Movie</h4>')
			.onSubmitSuccess(['progression', 'notification', '$state', 'entry', 'entity', function(progression, notification, $state, entry, entity) {
				progression.done();
				$state.go($state.get('edit'), { entity: entity.name(), id: entry._identifierValue });
				return false;
			}])
        .fields([
            nga.field('title', 'string')
				.attributes({ placeholder: 'Title' })
				.validation({ required: true })
				.label('Title'),
            nga.field('category_id', 'reference')
				.targetEntity(admin.getEntity('VodCategories'))
				.targetField(nga.field('name'))
				.attributes({placeholder: 'Select Category'})
				.validation({ required: true })
				.perPage(-1)
				.label('Category'),
			nga.field('package_id', 'reference')
				.targetEntity(admin.getEntity('Packages'))
				.targetField(nga.field('package_name'))
				.attributes({ placeholder: 'Select Package' })
				.permanentFilters({ package_type_id: [3,4] })
				.validation({ required: true })
				.perPage(-1)
				.label('Package'),
			nga.field('year', 'string')
				.attributes({ placeholder: 'Year' })
				.validation({ required: true })
				.label('Year'),
			nga.field('director', 'string')
				.attributes({ placeholder: 'Director' })
				.validation({ required: true })
				.label('Director'),	
			nga.field('rate', 'number')
				.attributes({ placeholder: 'Rate' })
				.validation({ required: true })
				.label('Rate'),
			nga.field('clicks', 'number')
				.attributes({ placeholder: 'Clicks' })
				.validation({ required: true })
				.label('Clicks'),
			nga.field('duration')
				.validation({ required: true })
				.attributes({ placeholder: 'Duration' })
				.label('Duration'),
			nga.field('description', 'text')
				.attributes({ placeholder: 'Description' })
				.validation({ required: true })
				.label('Description'),
			nga.field('starring', 'text')
				.attributes({ placeholder: 'Starring' })
				.validation({ required: true })
				.label('Starring'),
			nga.field('icon_url','file')
				.uploadInformation({ 'url': '/file-upload/single-file/vod/icon_url','apifilename': 'result'})
                .template('<div class="row">'+
                          '<div class="col-xs-12 col-sm-1"><img src="{{ entry.values.icon_url }}" height="40" width="40" /></div>'+
                          '<div class="col-xs-12 col-sm-8"><ma-file-field field="field" value="entry.values.icon_url"></ma-file-field></div>'+
                        '</div>'+
						'<div class="row"><small id="emailHelp" class="form-text text-muted">360x516 px</small></div>')
               	.validation({
				    validator: function(value) {
				        if (value == null) {
				            throw new Error('Please, choose icon');
				        }
				    }
				})
                .label('Icon *'),
			nga.field('image_url','file')
				.uploadInformation({ 'url': '/file-upload/single-file/vod/image_url','apifilename': 'result'})
                .template('<div class="row">'+
                          '<div class="col-xs-12 col-sm-1"><img src="{{ entry.values.image_url }}" height="40" width="40" /></div>'+
                          '<div class="col-xs-12 col-sm-8"><ma-file-field field="field" value="entry.values.image_url"></ma-file-field></div>'+
                        '</div>'+
						'<div class="row"><small id="emailHelp" class="form-text text-muted">1920x1200 px</small></div>')
               	.validation({
				    validator: function(value) {
				        if (value == null) {
				            throw new Error('Please, choose image');
				        }
				    }
				})
               	.label('Image *'),
			nga.field('pin_protected','boolean')
				.attributes({ placeholder: 'Pin Protected' })
				.validation({ required: true })
				.label('Pin Protected'),
			nga.field('isavailable','boolean')
				.attributes({ placeholder: 'Is Available' })
				.validation({ required: true })
				.label('Is Available'),
            nga.field('template')
            	.label('')
            	.template(edit_button),
        ]);

    vod.editionView()
    	.title('<h4>Vods <i class="fa fa-angle-right" aria-hidden="true"></i> Edit: {{ entry.values.title }}</h4>')    
    	.actions(['list', '<ma-delete-button label="Remove" entry="entry" entity="entity"></ma-delete-button>'])        
        .fields([
        	vod.creationView().fields(),
           	nga.field('vodsubtitles', 'referenced_list')
           			.label('Subtitles')
                    .targetEntity(admin.getEntity('vodsubtitles'))
                    .targetReferenceField('vod_id')
                    .targetFields([
                        nga.field('title')
                            .label('Language'),
                    ])
                     .listActions(['edit', 'delete']),
                nga.field('ADD SUBTITLES', 'template')
                   .label('')
                   .template('<ma-create-button entity-name="vodsubtitles" class="pull-right" label="ADD SUBTITLES" default-values="{ vod_id: entry.values.id }"></ma-create-button>'),
            
            nga.field('vodstreams', 'referenced_list')
             		.label('Stream Sources')
             		.targetEntity(admin.getEntity('vodstreams'))
             		.targetReferenceField('vod_id')
             		.targetFields([
                        nga.field('url')
                    .map(function truncate(value) {
	                 	if (!value) {
	                            return '';
	                      	}
	                            return value.length > 35 ? value.substr(0, 35) + '...' : value;
	                    })
                        .label('Vod URL'),
                    ])
                    .listActions(['edit', 'delete']),
                nga.field('ADD STREAM', 'template')
                   .label('')
                   .template('<ma-create-button entity-name="vodstreams" class="pull-right" label="ADD STREAM" default-values="{ vod_id: entry.values.id }"></ma-create-button>'),
        ])

	return vod;
	
}