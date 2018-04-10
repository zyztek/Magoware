var moment = require('moment');
var fromNow = v => moment(v).fromNow();
import dashboard from './dashboard.html'

export default function (nga, admin) {

	return nga.dashboard()
        .addCollection(nga.collection(admin.getEntity('Salesreports'))
                .name('sales_report')
                .title('Last 10 sales')
                .fields([
					nga.field('user_id', 'reference')
						.targetEntity(admin.getEntity('Users'))
		                .targetField(nga.field('username'))
		                .cssClasses('hidden-xs')
						.label('User'),
					nga.field('combo_id', 'reference')
						.targetEntity(admin.getEntity('Combos'))
		                .targetField(nga.field('name'))
						.label('Product'),
					nga.field('user_username')
						.label('Customers Username'),
					nga.field('distributorname', 'string')
						.cssClasses('hidden-xs')
						.label('Distributor'),
					nga.field('saledate', 'date')
						.cssClasses('hidden-xs')
						.label('Sale Date'),
                ])
                .perPage(10)
        )

        .addCollection(nga.collection(admin.getEntity('LoginData'))
                .name('login_accounts')
                .title('Last 10 accounts created')
                .fields([
					nga.field('customer_id','reference')
						.targetEntity(admin.getEntity('CustomerData'))
		                .targetField(nga.field('firstname').map(function (value, entry) {
							return entry.firstname + ' ' + entry.lastname;
						}))
						.cssClasses('hidden-xs')
						.label('Customer'),

					nga.field('username', 'string')
						.label('Customers Username'),
					nga.field('pin', 'string')
						.cssClasses('hidden-xs')
						.label('Pin'),
					nga.field('timezone', 'number')
						.cssClasses('hidden-xs')
						.label('Timezone'),
					nga.field('force_upgrade', 'boolean')
						.cssClasses('hidden-xs')
						.label('Force Upgrade'),
					nga.field('account_lock','boolean')
						.cssClasses('hidden-xs')
						.label('Account Lock'),
					nga.field('auto_timezone', 'boolean')
						.cssClasses('hidden-xs')
						.label('Auto Timezone'),
					nga.field('vodlastchange', 'boolean')
						.cssClasses('hidden-xs')
						.label('Update Vod Data'),
                ])
                .listActions(['edit'])
                .perPage(10)
        )

        .template(dashboard);
}
