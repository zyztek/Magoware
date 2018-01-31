import edit_button from '../edit_button.html';
import filter_genre_btn from '../filter_genre_btn.html';

export default function (nga, admin) {
	var genre = admin.getEntity('Genres');
	genre.listView()
			.title('<h4>Genres <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
			.batchActions([])
			.fields([
				nga.field('description', 'string')
						.label('Description'),
				nga.field('icon_url', 'file')
						.template('<img src="{{ entry.values.icon_url }}" height="35" width="35" />')
						.cssClasses('hidden-xs')
						.label('Icon'),
				nga.field('is_available', 'boolean')
						.label('Available'),
				nga.field('channels')
						.map(function total(value, entry) {
							var obj = [];
							for (var i = value.length - 1; i >= 0; i--) {
								obj[i] = value[i].total;
								return obj[i];
							}
						})
						.label('Number of Channels'),
			])
			.listActions(['edit', 'delete'])
			.exportFields([
				genre.listView().fields(),
			]);

	genre.deletionView()
			.title('<h4>Genre <i class="fa fa-angle-right" aria-hidden="true"></i> Remove <span style ="color:red;"> {{ entry.values.description }} </span></h4>')
			.actions(['<ma-back-button entry="entry" entity="entity"></ma-back-button>'])


	genre.creationView()
			.title('<h4>Genres <i class="fa fa-angle-right" aria-hidden="true"></i> Create: Genre</h4>')
			.fields([
				nga.field('description', 'string')
						.attributes({ placeholder: 'Genre Name' })
						.validation({ required: true })
						.label('Description'),
				nga.field('is_available','boolean')
						.attributes({ placeholder: 'Is Available' })
						.validation({ required: true })
						.label('Is Available'),
				nga.field('icon_url','file')
						.uploadInformation({ 'url': '/file-upload/single-file/genre/icon_url','apifilename': 'result'})
						.template('<div class="row">'+
								'<div class="col-xs-12 col-sm-1"><img src="{{ entry.values.icon_url }}" height="40" width="40" /></div>'+
								'<div class="col-xs-12 col-sm-8"><ma-file-field field="field" value="entry.values.icon_url"></ma-file-field></div>'+
								'</div>'+
								'<div class="row"><small id="emailHelp" class="form-text text-muted">120x120 px</small></div>')
						.validation({
							validator: function(value) {
								if (value == null) {
									throw new Error('Please, choose icon');
								}
							}
						})
						.label('icon *'),
				nga.field('template')
						.label('')
						.template(edit_button),
			]);

	genre.editionView()
			.title('<h4>Genres <i class="fa fa-angle-right" aria-hidden="true"></i> Edit: {{ entry.values.description }}</h4>')
			.actions(['list'])
			.fields([
				genre.creationView().fields(),
				nga.field('', 'referenced_list')
						.label('Channel')
						.targetEntity(admin.getEntity('Channels'))
						.targetReferenceField('genre_id')
						.targetFields([
							nga.field('channel_number')
									.label('Nr'),
							nga.field('icon_url', 'file')
									.template('<img src="{{ entry.values.icon_url }}" height="35" width="35" />')
									.label('Icon'),
							nga.field('title', 'string')
									.attributes({ placeholder: 'Title' })
									.validation({ required: true })
									.label('Title')
						])
						.listActions(['edit']),
				nga.field('template')
						.label('')
						.template(filter_genre_btn),
			]);

	return genre;

}
