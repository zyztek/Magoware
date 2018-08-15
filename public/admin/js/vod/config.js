import edit_button from '../edit_button.html';
//import foto from '../foto.html';

export default function (nga, admin) {
    var vod = admin.getEntity('Vods');
    vod.listView()
        .title('<h4>Vods <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
        .batchActions([
            '<vod type="update_film" selection="selection"></vod>'
        ])
        .actions(['<move type="move_to_package" selection="selection"></move>','batch', 'export', 'filter','create'])
        .fields([
            nga.field('title', 'string')
                .label('Title'),
            nga.field('expiration_time', 'datetime')
                .label('Expiration Time'),
            nga.field('vod_vod_categories')
                .cssClasses('hidden')
                .map(function getpckgid(value, entry) {
                    var return_object = [];
                    for (var i = 0; i < value.length; i++) {
                        return_object[i] = value[i].category_id;
                    }
                    return return_object;
                })
                .label('Vod in categories'),
            nga.field('vod_vod_categories','reference_many')
                .targetEntity(admin.getEntity('VodCategories'))
                .targetField(nga.field('name'))
                .singleApiCall(function (category_id) {
                    return { 'category_id[]': category_id };
                }).label('Genres'),
            nga.field('package_vods')
                .cssClasses('hidden')
                .map(function getpckgid(value, entry) {
                    var return_object = [];
                    for (var i = 0; i < value.length; i++) return_object[i] = value[i].package_id;
                    return return_object;
                })
                .label('Vod in packages'),
            nga.field('package_vods','reference_many')
                .targetEntity(admin.getEntity('Packages'))
                .perPage(-1)
                .permanentFilters({ package_type_id: [3,4] })
                .targetField(nga.field('package_name'))
                .singleApiCall(function (package_id) {
                    return { 'package_id[]': package_id };
                }).label('Packages'),
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
            nga.field('createdAt','date')
                .cssClasses('hidden-xs')
                .label('Created at'),
            nga.field('pin_protected','boolean')
                .cssClasses('hidden-xs')
                .label('Pin Protected'),
        ])
        .sortDir("DESC")
        .sortField("createdAt")
        .filters([
            nga.field('not_id', 'reference')
                .targetEntity(admin.getEntity('vodPackages'))
                .permanentFilters({ package_type_id: [3,4] })
                .targetField(nga.field('package_name'))
                .label('Not In Package'),
            nga.field('expiration_time', 'datetime')
                .label('Expiration Time'),
            nga.field('title')
                .label('Title'),
            nga.field('pin_protected','choice')
                .choices([
                    { value: 0, label: 'False' },
                    { value: 1, label: 'True' }
                ])
                .attributes({ placeholder: 'Pin Protected' })
                .label('Pin Protected'),
            nga.field('category', 'reference')
                .targetEntity(admin.getEntity('VodCategories'))
                .perPage(-1)
                .targetField(nga.field('name'))
                .label('Category'),
            nga.field('added_before', 'datetime')
                .label('Added before'),
            nga.field('added_after', 'datetime')
                .label('Added after'),
            nga.field('updated_before', 'date')
                .label('Last updated before'),
            nga.field('updated_after', 'date')
                .label('Last updated after'),
            nga.field('isavailable', 'boolean')
                .filterChoices([
                    { value: true, label: 'Available' },
                    { value: false, label: 'Not Available' }
                ])
                .label('Available'),
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
                .attributes({ placeholder: 'Movie Name' })
                .validation({ required: true })
                .label('Title'),
            nga.field('imdb_id', 'string')
                .attributes({ placeholder: 'Movie Imdb Id' })
                .template(
                    '<ma-input-field field="field" value="entry.values.imdb_id"></ma-input-field>'+
                    '<small id="emailHelp" class="form-text text-muted">*This Id should either be left empty, or match exactly the Imdb Id</small>'
                )
                .label('Movie Imdb Id'),
            nga.field('vod_vod_categories','reference_many')
                .targetEntity(admin.getEntity('VodCategories'))
                .targetField(nga.field('name'))
                .label('Genres')
                .attributes({ placeholder: 'Select genre' })
                .map(function getpckgid(value, entry) {
                    var return_object = [];
                    for (var i = 0; i < value.length; i++) {
                        return_object[i] = value[i].category_id;
                    }
                    return return_object;
                })
                .singleApiCall(function (category_id) {
                    return { 'category_id[]': category_id };
                }),
            nga.field('package_vods','reference_many')
                .targetEntity(admin.getEntity('Packages'))
                .permanentFilters({ package_type_id: [3,4] })
                .targetField(nga.field('package_name'))
                .label('Packages')
                .attributes({ placeholder: 'Select packages' })
                .map(function getpckgid(value, entry) {
                    var return_object = [];
                    for (var i = 0; i < value.length; i++) {
                        return_object[i] = value[i].package_id;
                    }
                    return return_object;
                })
                .singleApiCall(function (package_id) {
                    return { 'package_id[]': package_id };
                }),
            nga.field('year', 'string')
                .attributes({ placeholder: 'Movie Year' })
                .validation({ required: true })
                .label('Year'),
            nga.field('director', 'string')
                .attributes({ placeholder: 'Movie Director' })
                .validation({ required: true })
                .label('Director'),
            nga.field('rate', 'number')
                .attributes({ placeholder: 'Movie rated. Must be greater than 0, smaller or equal to 10' })
                .validation({ required: true, validator: function(value){
                    if(value<=0) throw  new Error ('Rate must be greater than 0');
                    if(value>10) throw  new Error ('Rate cannot be greater than 10');
                }})
                .label('Rate'),
            nga.field('clicks', 'number')
                .attributes({ placeholder: 'Movie clicks' })
                .validation({ required: true })
                .label('Clicks'),
            nga.field('duration')
                .validation({ required: true })
                .attributes({ placeholder: 'Duration of movie in minutes' })
                .label('Duration'),
            nga.field('description', 'text')
                .transform(function lineBreaks(value, entry) {
                    return value.split("\n").join("<br/>");
                })
                .attributes({ placeholder: 'Movie Subject' })
                .validation({ required: true, maxlength: 1000})
                .label('Description'),
            nga.field('starring', 'text')
                .transform(function lineBreak(value, entry) {
                    return value.split("\n").join("<br/>");
                })
                .attributes({ placeholder: 'Movie actors' })
                .validation({ required: true, maxlength: 1000})
                .label('Starring'),
            nga.field('trailer_url', 'string')
                .defaultValue('')
                .attributes({ placeholder: 'Trailer url' })
                .label('Trailer url'),
            nga.field('vod_preview_url', 'file')
                .uploadInformation({ 'url': '/file-upload/single-file/video_scrubbing_url/vod_preview_url','apifilename': 'result'})
                .template('<div class="row">'+
                    '<div class="col-xs-12 col-sm-1"><img src="{{ entry.values.vod_preview_url }}" height="40" width="40" /></div>'+
                    '<div class="col-xs-12 col-sm-8"><ma-file-field field="field" value="entry.values.vod_preview_url"></ma-file-field></div>'+
                    '</div>'+
                    '<div class="row"><small id="emailHelp" class="form-text text-muted">Not larger than 1MB</small></div>')
                .defaultValue('')
                .validation({
                    validator: function(value) {
                        var vod_preview_url = document.getElementById('vod_preview_url');
                            if (vod_preview_url.value.length > 0) {
                                if(vod_preview_url.files[0].size > 1048576 ){
                                    throw new Error('Your File of Video scrubbing url is too Big, not larger than 1MB');
                                }
                            }

                    }
                })
                .label('Video scrubbing url'),
            nga.field('icon_url','file')
                .uploadInformation({ 'url': '/file-upload/single-file/vod/icon_url','apifilename': 'result'})
                .template('<div class="row">'+
                    '<div class="col-xs-12 col-sm-1"><img src="{{ entry.values.icon_url }}" height="40" width="40" /></div>'+
                    '<div class="col-xs-12 col-sm-8"><ma-file-field field="field" value="entry.values.icon_url"></ma-file-field></div>'+
                    '</div>'+
                    '<div class="row"><small id="emailHelp" class="form-text text-muted">360x516 px, not larger than 150 KB</small></div>')
                .validation({
                    validator: function(value) {
                        if (value == null) {
                            throw new Error('Please, choose icon');
                        }else {
                            var icon_url = document.getElementById('icon_url');
                            if (icon_url.value.length > 0) {
                                if(icon_url.files[0].size > 153600 ){
                                    throw new Error('Your Icon is too Big, not larger than 150 KB');
                                }
                            }
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
                    '<div class="row"><small id="emailHelp" class="form-text text-muted">1920x1200 px, not larger than 600 KB</small></div>')
                .validation({
                    validator: function(value) {
                        if (value == null) {
                            throw new Error('Please, choose image');
                        }else {
                            var image_url = document.getElementById('image_url');
                            if (image_url.value.length > 0) {
                                if(image_url.files[0].size > 614400 ){
                                    throw new Error('Your Image is too Big, not larger than 600 KB');
                                }
                            }
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
			nga.field('expiration_time','datetime')
                .validation({ required: true })
                .defaultValue(new Date())
                .label('Expiration date'),	
            nga.field('template')
                .label('')
                .template(edit_button),
        ]);

    vod.editionView()
        .title('<h4>Vods <i class="fa fa-angle-right" aria-hidden="true"></i> Edit: {{ entry.values.title }}</h4>')
        .actions(['list', '<ma-delete-button label="Remove" entry="entry" entity="entity"></ma-delete-button>'])
        .fields([
            //creation view fields
            nga.field('title', 'string')
                .attributes({ placeholder: 'Movie Name' })
                .validation({ required: true })
                .label('Title'),
            nga.field('imdb_id', 'string')
                .attributes({ placeholder: 'Movie Imdb Id' })
                .template(
                    '<ma-input-field field="field" value="entry.values.imdb_id"></ma-input-field>'+
                    '<small id="emailHelp" class="form-text text-muted">*This Id should either be left empty, or match exactly the Imdb Id</small>'
                )
                .label('Movie Imdb Id'),
            nga.field('vod_vod_categories','reference_many')
                .targetEntity(admin.getEntity('VodCategories'))
                .targetField(nga.field('name'))
                .label('Genres')
                .attributes({ placeholder: 'Select genre' })
                .map(function getpckgid(value, entry) {
                    var return_object = [];
                    for (var i = 0; i < value.length; i++) {
                        return_object[i] = value[i].category_id;
                    }
                    return return_object;
                })
                .singleApiCall(function (category_id) {
                    return { 'category_id[]': category_id };
                }),
            nga.field('package_vods','reference_many')
                .targetEntity(admin.getEntity('Packages'))
                .permanentFilters({ package_type_id: [3,4] })
                .targetField(nga.field('package_name'))
                .label('Packages')
                .attributes({ placeholder: 'Select packages' })
                .map(function getpckgid(value, entry) {
                    var return_object = [];
                    for (var i = 0; i < value.length; i++) {
                        return_object[i] = value[i].package_id;
                    }
                    return return_object;
                })
                .singleApiCall(function (package_id) {
                    return { 'package_id[]': package_id };
                }),
            nga.field('year', 'string')
                .attributes({ placeholder: 'Movie Year' })
                .validation({ required: true })
                .label('Year'),
            nga.field('director', 'string')
                .attributes({ placeholder: 'Movie Director' })
                .validation({ required: true })
                .label('Director'),
            nga.field('rate', 'number')
                .attributes({ placeholder: 'Movie rated. Must be greater than 0, smaller or equal to 10' })
                .validation({ required: true, validator: function(value){
                    if(value<=0) throw  new Error ('Rate must be greater than 0');
                    if(value>10) throw  new Error ('Rate cannot be greater than 10');
                }})
                .label('Rate'),
            nga.field('clicks', 'number')
                .attributes({ placeholder: 'Movie clicks' })
                .validation({ required: true })
                .label('Clicks'),
            nga.field('duration')
                .validation({ required: true })
                .attributes({ placeholder: 'Duration of movie in minutes' })
                .label('Duration'),
            nga.field('description', 'text')
                .transform(function lineBreaks(value, entry) {
                    return value.split("\n").join("<br/>");
                })
                .attributes({ placeholder: 'Movie Subject' })
                .validation({ required: true, maxlength: 1000 })
                .label('Description'),
            nga.field('starring', 'text')
                .transform(function lineBreak(value, entry) {
                    return value.split("\n").join("<br/>");
                })
                .attributes({ placeholder: 'Movie actors' })
                .validation({ required: true, maxlength: 1000 })
                .label('Starring'),
            nga.field('trailer_url', 'string')
                .attributes({ placeholder: 'Trailer url' })
                .label('Trailer url'),
            nga.field('vod_preview_url', 'file')
                .uploadInformation({ 'url': '/file-upload/single-file/video_scrubbing_url/vod_preview_url','apifilename': 'result'})
                .template('<div class="row">'+
                    '<div class="col-xs-12 col-sm-1"><img src="{{ entry.values.vod_preview_url }}" height="40" width="40" /></div>'+
                    '<div class="col-xs-12 col-sm-8"><ma-file-field field="field" value="entry.values.vod_preview_url"></ma-file-field></div>'+
                    '</div>'+
                    '<div class="row"><small id="emailHelp" class="form-text text-muted">Not larger than 1MB</small></div>')
                .defaultValue('')
                .validation({
                    validator: function(value) {
                        var vod_preview_url = document.getElementById('vod_preview_url');
                            if (vod_preview_url.value.length > 0) {
                                if(vod_preview_url.files[0].size > 1048576 ){
                                    throw new Error('Your File of Video scrubbing url is too Big, not larger than 1MB');
                                }
                            }

                    }
                })
                .label('Video scrubbing url'),
            nga.field('icon_url','file')
                .uploadInformation({ 'url': '/file-upload/single-file/vod/icon_url','apifilename': 'result'})
                .template('<div class="row">'+
                    '<div class="col-xs-12 col-sm-1"><img src="{{ entry.values.icon_url }}" height="40" width="40" /></div>'+
                    '<div class="col-xs-12 col-sm-8"><ma-file-field field="field" value="entry.values.icon_url"></ma-file-field></div>'+
                    '</div>'+
                    '<div class="row"><small id="emailHelp" class="form-text text-muted">360x516 px, not larger than 150 KB</small></div>')
                .validation({
                    validator: function(value) {
                        if (value == null) {
                            // throw new Error('Please, choose icon');
                        }else {
                            var icon_url = document.getElementById('icon_url');
                            if (icon_url.value.length > 0) {
                                if(icon_url.files[0].size > 153600 ){
                                    throw new Error('Your Icon is too Big, not larger than 150 KB');
                                }
                            }
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
                    '<div class="row"><small id="emailHelp" class="form-text text-muted">1920x1200 px, not larger than 600 KB</small></div>')
                .validation({
                    validator: function(value) {
                        if (value == null) {
                            throw new Error('Please, choose image');
                        }else {
                            var image_url = document.getElementById('image_url');
                            if (image_url.value.length > 0) {
                                if(image_url.files[0].size > 614400 ){
                                    throw new Error('Your Image is too Big, not larger than 600 KB');
                                }
                            }
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
			nga.field('expiration_time','datetime')
                .validation({ required: true })
                .defaultValue(new Date())
                .label('Expires in'),	
            //default subtitle field is exclusive to the edition view
            nga.field('default_subtitle_id', 'choice')
                .choices(function(entry) {
                    var no_sub_object = {value: 0, label: "No default subtitles", selected: true};
                    entry.values.vod_subtitles.unshift(no_sub_object);
                    return entry.values.vod_subtitles;
                })
                .label('Default subtitles'),
            nga.field('template')
                .label('')
                .template(edit_button),


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
                        // .map(function truncate(value) {
                        //     if (!value) {
                        //         return '';
                        //     }
                        //     return value.length > 35 ? value.substr(0, 35) + '...' : value;
                        // })
                        .label('Vod URL'),
                ])
                .listActions(['edit', 'delete']),
            nga.field('ADD STREAM', 'template')
                .label('')
                .template('<ma-create-button entity-name="vodstreams" class="pull-right" label="ADD STREAM" default-values="{ vod_id: entry.values.id }"></ma-create-button>'),
        ])

    return vod;

}