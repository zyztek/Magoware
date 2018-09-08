export default function (nga, admin) {
    var salesreport = admin.getEntity('sales_by_month');
    salesreport.listView()
        .title('<h4>Sales by month <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
        .batchActions([])
        .fields([
            nga.field('saledate', 'date')
                .cssClasses('hidden-xs')
                .label('Month/year'),
            nga.field('count', 'number')
                .cssClasses('hidden-xs')
                .label('Sale no.'),
            nga.field('combo.total_value', 'number')
                .cssClasses('hidden-xs')
                .label('Total earnings'),
        ])
        .filters([
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