export default function (nga, admin) {
	var salesreport = admin.getEntity('Salesreports');
	salesreport.listView()
			.title('<h4>Salesreports <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
			.batchActions(['filter'])
			.fields([
				nga.field('user_id', 'reference')
						.targetEntity(admin.getEntity('Users'))
						.targetField(nga.field('username'))
						.cssClasses('hidden-xs')
						.label('User'),
				nga.field('user_username')
						.label('User Username'),
				nga.field('distributorname', 'string')
						.cssClasses('hidden-xs')
						.label('Distributor Name'),
				nga.field('saledate', 'date')
						.cssClasses('hidden-xs')
						.label('Sale Date'),
				nga.field('combo_id', 'reference')
						.targetEntity(admin.getEntity('Combos'))
						.targetField(nga.field('name'))
						.label('Products'),
			])
			.filters([
				nga.field('q')
						.label('')
						.template('<div class="input-group"><input type="text" ng-model="value" placeholder="Search" class="form-control"></input><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span></div>')
						.pinned(true),
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
				nga.field('name')
						.attributes({ placeholder: 'Product' })
						.label('Product')
			])

			.exportFields([
				salesreport.listView().fields(),
			]);

	return salesreport;

}
