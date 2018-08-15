import edit_button from '../edit_button.html';
import filter_genre_btn from '../filter_genre_btn.html';

export default function (nga, admin) {
	var mychann = admin.getEntity('mychannels');
	mychann.listView()
		.title('<h4>My  Channels <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
		.batchActions([])
		.fields([
			nga.field('login_id', 'reference')
				.targetEntity(admin.getEntity('LoginData'))
                .targetField(nga.field('username'))
				.label('Username'),
            nga.field('title', 'string')
                .label('Title'),
            nga.field('channel_number')
                .label('Channel Nr'),
			nga.field('genre_id', 'reference')
					.targetEntity(admin.getEntity('Genres'))
					.targetField(nga.field('description'))
					.label('Genre'),
			nga.field('description', 'string')
				.label('Description'),
			nga.field('isavailable', 'boolean')
				.label('Is Available'),
		])
        .listActions(['edit', 'delete'])
        .filters([
          nga.field('q')
              .label('')
              .template('<div class="input-group"><input type="text" ng-model="value" placeholder="Search" class="form-control"></input><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span></div>')
              .pinned(true)])


    mychann.creationView()
        .title('<h4>My  Channels <i class="fa fa-angle-right" aria-hidden="true"></i> Create</h4>')
        .fields([
            nga.field('login_id', 'reference')
                .targetEntity(admin.getEntity('LoginData'))
                .targetField(nga.field('username'))
                .perPage(-1)
                .attributes({ placeholder: 'Select Account from dropdown list' })
                .label('Username'),
            nga.field('title', 'string')
                .attributes({ placeholder: 'Title' })
                .label('Title'),
            nga.field('channel_number')
                .attributes({ placeholder: 'Channel Nr' })
                .label('Channel Nr'),
            nga.field('stream_url', 'string')
                .attributes({ placeholder: 'Stream Url' })
                .label('Stream Url'),
            nga.field('genre_id', 'reference')
                .targetEntity(admin.getEntity('Genres'))
                .targetField(nga.field('description'))
                .validation({ required: true })
                .attributes({ placeholder: 'Select genre' })
                .label('Genre'),
            nga.field('description', 'string')
                .attributes({ placeholder: 'Description' })
                .label('Description'),
            nga.field('isavailable', 'boolean')
                .validation({ required: true })
                .label('Is Available'),
            nga.field('template')
                .label('')
                .template(edit_button),
        ]);


	mychann.deletionView()
			.title('<h4>User Channels <i class="fa fa-angle-right" aria-hidden="true"></i> Remove <span style ="color:red;"> {{ entry.values.title }} </span></h4>')
			.actions(['<ma-back-button entry="entry" entity="entity"></ma-back-button>'])

		mychann.editionView()
			.title('<h4>My  Channels <i class="fa fa-angle-right" aria-hidden="true"></i> Create</h4>')
			.fields([
					mychann.creationView().fields(),
			])
		              

	return mychann;
}