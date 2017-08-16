
export default function (nga, admin) {
	var grouprights = admin.getEntity('Grouprights');
	grouprights.listView()
			.title('<h4>User Groups <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
			.actions([])
			.batchActions([])
			.fields([
				nga.field('api_url', 'string')
						.label('Api Name'),
				nga.field('description', 'string')
						.label('Description'),
				nga.field('permitions', 'string')
						.label('Permitions'),
			])

	return grouprights;

}