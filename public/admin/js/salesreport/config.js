export default function (nga, admin) {
	var salesreport = admin.getEntity('Salesreports');
	salesreport.listView()
			.title('<h4>Sale report <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
			.listActions([])
			.batchActions([
				'<sale type="cancel_sale" selection="selection"></sale>'
			])
			.fields([
				nga.field('user.username', 'string')
						.cssClasses('hidden-xs')
						.label('Agent'),
				nga.field('user_username')
						.label('Account Username'),
				nga.field('saledate', 'date')
						.cssClasses('hidden-xs')
						.label('Sale Date'),
				nga.field('combo.name', 'string')
						.label('Products'),
				nga.field('active', 'boolean')
						.label('Active sale'),
			]).filters([
				nga.field('user_username')
						.attributes({ placeholder: 'Client' })
						.label('Client'),
				nga.field('distributorname')
						.attributes({ placeholder: 'Distributor' })
						.label('Distributor'),
				nga.field('startsaledate', 'date')
						.attributes({ placeholder: 'From date' })
						.label('From date'),
				nga.field('endsaledate', 'date')
						.attributes({placeholder: 'To date' })
						.label('To date'),
				nga.field('name', 'reference')
						.targetEntity(admin.getEntity('Combos'))
						.attributes({ placeholder: 'Product' })
						.perPage(-1)
						.targetField(nga.field('name'))
						.label('Product'),
				nga.field('active', 'choice')
						.choices([
							{ value: 'active', label: 'Active sales' },
							{ value: 'cancelled', label: 'Canceled sales' },
							{ value: 'all', label: 'All sales' }
						])
						.attributes({placeholder: 'Sale active' })
						.label('Sale status'),
			])
			.exportFields([
				salesreport.listView().fields(),
			]);

	return salesreport;

}
