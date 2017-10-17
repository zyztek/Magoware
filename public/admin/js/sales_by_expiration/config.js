export default function (nga, admin) {
    var salesreport = admin.getEntity('sales_by_expiration');
    salesreport.listView()
        .title('<h4>Sales by expiration <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
        .fields([

            nga.field('login_id', 'reference')
                .targetEntity(admin.getEntity('LoginData'))
                .targetField(nga.field('username'))
                .cssClasses('hidden-xs')
                .label('Client'),
            nga.field('end_date', 'date')
                .cssClasses('hidden-xs')
                .label('End Date')
        ])
        .filters([
            nga.field('startsaledate', 'date')
                .attributes({ placeholder: 'Sale date from' })
                .label('Start sale date'),
            nga.field('endsaledate', 'date')
                .attributes({placeholder: 'Sale date to' })
                .label('End sale date')
        ])
        .exportFields([
            salesreport.listView().fields(),
        ]);

    return salesreport;

}
