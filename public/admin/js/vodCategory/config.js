import edit_button from '../edit_button.html';

export default function (nga, admin) {
	var vodcategory = admin.getEntity('VodCategories');
	vodcategory.listView()
			.title('<h4>Vod Categories <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
			.batchActions([])
			.fields([
				nga.field('icon_url', 'file')
						.template('<img src="{{ entry.values.icon_url }}" height="35" width="35" />')
						.cssClasses('hidden-xs')
						.label('Icon'),
				nga.field('small_icon_url', 'file')
						.template('<img src="{{ entry.values.small_icon_url }}" height="35" width="35" />')
						.cssClasses('hidden-xs')
						.label('Small icon'),
				nga.field('name', 'string')
						.label('Name'),
				nga.field('description', 'text')
						.cssClasses('hidden-xs')
						.label('Description'),
				nga.field('sorting', 'string')
						.cssClasses('hidden-xs')
						.label('Sorting'),
				nga.field('isavailable', 'boolean')
						.label('Available'),
				nga.field('password', 'boolean')
						.label('Password'),
			])
			.listActions(['edit', '<ma-delete-button label="Remove" entry="entry" entity="entity" size="xs"></ma-delete-button>'])
			.exportFields([
				vodcategory.listView().fields(),
			]);


	vodcategory.deletionView()
			.title('<h4>Vod Category <i class="fa fa-angle-right" aria-hidden="true"></i> Remove <span style ="color:red;"> {{ entry.values.name }} </span></h4>')
			.actions(['<ma-back-button entry="entry" entity="entity"></ma-back-button>'])


	vodcategory.creationView()
			.title('<h4>Vod Categories <i class="fa fa-angle-right" aria-hidden="true"></i> Create: Vod Category</h4>')
			.fields([
				nga.field('name', 'string')
						.attributes({ placeholder: 'Name' })
						.validation({ required: true })
						.label('Name'),
				nga.field('description', 'text')
						.attributes({ placeholder: 'Description' })
						.validation({ required: true })
						.label('Description'),
				nga.field('sorting', 'number')
						.attributes({ placeholder: 'Sorting' })
						.validation({ required: true })
						.label('Sorting'),
				nga.field('icon_url','file')
						.uploadInformation({ 'url': '/file-upload/single-file/vodcategory/icon_url','apifilename': 'result'})
						.template('<div class="row">'+
								'<div class="col-xs-12 col-sm-1"><img src="{{ entry.values.icon_url }}" height="40" width="40" /></div>'+
								'<div class="col-xs-12 col-sm-8"><ma-file-field field="field" value="entry.values.icon_url"></ma-file-field></div>'+
								'</div>'+
								'<div class="row"><small id="emailHelp" class="form-text text-muted">1920x1200 px</small></div>')
						.validation({
							validator: function(value) {
								if (value == null) {
									throw new Error('Please, choose icon');
								}
							}
						})
						.label('Icon *'),
				nga.field('small_icon_url','file')
						.uploadInformation({ 'url': '/file-upload/single-file/vodcategory/small_icon_url','apifilename': 'result'})
						.template('<div class="row">'+
								'<div class="col-xs-12 col-sm-1"><img src="{{ entry.values.small_icon_url }}" height="40" width="40" /></div>'+
								'<div class="col-xs-12 col-sm-8"><ma-file-field field="field" value="entry.values.small_icon_url"></ma-file-field></div>'+
								'</div>'+
								'<div class="row"><small id="emailHelp" class="form-text text-muted">159x117 px</small></div>')
						.validation({
							validator: function(value) {
								if (value == null) {
									throw new Error('Please, choose icon');
								}
							}
						})
						.label('Small icon *'),
				nga.field('password', 'boolean')
						.attributes({ placeholder: 'Password' })
						.validation({ required: true })
						.label('Password'),
				nga.field('isavailable', 'boolean')
						.attributes({ placeholder: 'Is Available' })
						.validation({ required: true })
						.label('Is Available'),
				nga.field('template')
						.label('')
						.template(edit_button),
			]);

	vodcategory.editionView()
			.title('<h4>Vod Categories <i class="fa fa-angle-right" aria-hidden="true"></i> Edit: {{ entry.values.name }}</h4>')
			.actions(['list'])
			.fields([
				vodcategory.creationView().fields(),
			]);


	return vodcategory;

}
