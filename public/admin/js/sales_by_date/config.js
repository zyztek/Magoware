export default function (nga, admin) {
    var salesreport = admin.getEntity('sales_by_date');
    salesreport.listView()
        .title('<h4>Sales per day <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
        .fields([
            nga.field('saledate', 'date')
                .cssClasses('hidden-xs')
                .label('Day'),
            nga.field('count', 'number')
                .cssClasses('hidden-xs')
                .label('Sale no.'),
            nga.field('combo.total_value', 'number')
                .cssClasses('hidden-xs')
                .label('Total earnings')
        ])
        .filters([
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
        ])
        .exportFields([
            salesreport.listView().fields(),
        ]);

    return salesreport;

}