export default function (nga, admin) {
	var salesreport = admin.getEntity('Salesreports');
	salesreport.listView()
			.listActions(['delete', 'show'])
			.title('<h4>Sale report <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
			.fields([
				nga.field('user_id', 'reference')
						.targetEntity(admin.getEntity('Users'))
						.targetField(nga.field('username'))
						.cssClasses('hidden-xs')
						.label('Seller ID'),
				nga.field('user_username')
						.label('Account Username'),
				nga.field('saledate', 'date')
						.cssClasses('hidden-xs')
						.label('Sale Date'),
				nga.field('combo_id', 'reference')
						.targetEntity(admin.getEntity('Combos'))
						.targetField(nga.field('name'))
						.label('Products'),
			]).filters([
		nga.field('user_username')
				.attributes({ placeholder: 'Client' })
				.label('Client'),
		nga.field('distributorname')
				.attributes({ placeholder: 'Distributor' })
				.label('Distributor'),
		nga.field('startsaledate', 'date')
				.attributes({ placeholder: 'Sale date from' })
				.label('Start sale date'),
		nga.field('endsaledate', 'date')
				.attributes({placeholder: 'Sale date to' })
				.label('End sale date'),
		nga.field('name', 'reference')
				.targetEntity(admin.getEntity('Combos'))
				.attributes({ placeholder: 'Product' })
				.perPage(-1)
				.targetField(nga.field('name'))
				.label('Product'),
	]).exportFields([
		salesreport.listView().fields(),
	]);

	salesreport.showView()
			.fields([
				nga.field('user_username')
						.label('Account Username'),
				nga.field('user_username')
						.label('Account Username'),
				nga.field('user_username')
						.label('Account Username')
			])
			.actions(['list', 'delete', '<custom-directive></custom-directive>'])

	return salesreport;

}
