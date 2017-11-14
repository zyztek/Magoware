export default function (nga, admin) {
    var salesreport = admin.getEntity('sales_by_product');
    salesreport.listView()
        .title('<h4>Sales by product <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
        .batchActions([])
        .fields([
            nga.field('combo.name', 'string')
                .label('Product '),
            nga.field('count', 'number')
                .cssClasses('hidden-xs')
                .label('Sales Total'),
            nga.field('saledate', 'date')
                .cssClasses('hidden-xs')
                .label('Last sold on'),
            nga.field('combo.duration', 'string')
                .label('Duration (days)'),
            nga.field('combo.value', 'string')
                .label('Product price')
        ]).filters([
            nga.field('startsaledate', 'date')
                .attributes({ placeholder: 'From date' })
                .label('From date'),
            nga.field('endsaledate', 'date')
                .attributes({placeholder: 'To date' })
                .label('To date'),
            nga.field('active', 'choice')
                .choices([
                    { value: 'active', label: 'Active sales' },
                    { value: 'cancelled', label: 'Canceled sales' },
                    { value: 'all', label: 'All sales' }
                ])
                .attributes({placeholder: 'Sale active' })
                .label('Sale status'),
        ]).exportFields([
            salesreport.listView().fields(),
        ]);

    return salesreport;

}
