export default function (nga, admin) {
    var salesreport = admin.getEntity('sales_monthly_expiration');
    salesreport.listView()
        .title('<h4>Subscription expirations by month<i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
        .batchActions([])
        .fields([
            nga.field('enddate', 'date')
                .cssClasses('hidden-xs')
                .label('Month/year'),
            nga.field('count', 'number')
                .cssClasses('hidden-xs')
                .label('Sale no.')
        ])
        .filters([
            nga.field('username', 'string')
                .attributes({ placeholder: 'Client' }),
            nga.field('startsaledate', 'date')
                .attributes({ placeholder: 'From date' })
                .label('From date'),
            nga.field('endsaledate', 'date')
                .attributes({placeholder: 'To date' })
                .label('To date')
        ])
        .exportFields([
            salesreport.listView().fields(),
        ]);

    return salesreport;

}