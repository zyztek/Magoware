import edit_button from '../edit_button.html';

export default function (nga, admin) {
	var vodsubtitles = admin.getEntity('vodsubtitles');
	vodsubtitles.listView()
			.title('<h4>Vod Subtitles <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
			.batchActions([])
			.fields([
				nga.field('vod_id', 'reference')
						.targetEntity(admin.getEntity('Vods'))
						.targetField(nga.field('title'))
						.label('Vod'),
				nga.field('title', 'string')
						.label('Title'),
				nga.field('subtitle_url', 'string')
						.map(function truncate(value) {
							if (!value) {
								return '';
							}
							return value.length > 25 ? value.substr(0, 25) + '...' : value;
						})
						.label('Subtitle Url'),
			])
			.filters([
				nga.field('q')
						.label('')
						.template('<div class="input-group"><input type="text" ng-model="value" placeholder="Search" class="form-control"></input><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span></div>')
						.pinned(true)])
			.listActions(['edit'])
			.exportFields([
				vodsubtitles.listView().fields(),
			]);

	vodsubtitles.deletionView()
			.title('<h4>Channel Streams <i class="fa fa-angle-right" aria-hidden="true"></i> Remove <span style ="color:red;"> {{entry.values.title}}')
			.actions(['<ma-back-button entry="entry" entity="entity"></ma-back-button>'])


	vodsubtitles.creationView()
			.title('<h4>Vod Subtitles <i class="fa fa-angle-right" aria-hidden="true"></i> Create: Vod Subtitles</h4>')
			.onSubmitSuccess(['progression', 'notification', '$state', 'entry', 'entity', function(progression, notification, $state, entry, entity) {
				progression.done();
				$state.go($state.get('edit'), { entity: 'Vods', id: entry.values.vod_id });

				return false;
			}])
			.fields([
				nga.field('vod_id', 'reference')
						.targetEntity(admin.getEntity('Vods'))
						.targetField(nga.field('title'))
						.attributes({ placeholder: 'Select Vod' })
						.validation({ required: true })
						.perPage(-1)
						.label('Vod'),
				nga.field('title')
						.attributes({ placeholder: 'Title' })
						.validation({ required: true })
						.label('Title'),
				nga.field('subtitle_url' ,'file')
						.uploadInformation({ 'url': '/file-upload/single-file/subtitles/subtitle_url','apifilename': 'result'})
						.validation({ required: true })
						.label('URL'),
				nga.field('template')
						.label('')
						.template(edit_button),
			]);

	vodsubtitles.editionView()
			.title('<h4>Vod Subtitles <i class="fa fa-angle-right" aria-hidden="true"></i> Edit: {{ entry.values.vod_id }}</h4>')
			.actions(['list', 'delete'])
			.fields([
				vodsubtitles.creationView().fields(),
			]);


	return vodsubtitles;

}
