var moment = require('moment');
var fromNow = v => moment(v).fromNow();
import dashboard from './resellers_dashboard.html'

export default function (nga, admin) {

    return nga.dashboard()
        .addCollection(nga.collection(admin.getEntity('MySales'))
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
            .permanentFilters({
                distributorname: localStorage.userName
            })
            .perPage(10)
        )

        .template(dashboard);
}