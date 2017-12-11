export default function (nga, admin) {
    var salesreport = admin.getEntity('sales_by_expiration');
    salesreport.listView()
        .title('<h4>Expirations list <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
        .batchActions([])
        .fields([

            nga.field('login_id', 'reference')
                .targetEntity(admin.getEntity('LoginData'))
                .targetField(nga.field('username'))
                .cssClasses('hidden-xs')
                .label('Client'),
            nga.field('end_date', 'date')
                .cssClasses('hidden-xs')
                .label('Expiration date')
        ])
        .filters([
            nga.field('startsaledate', 'date')
                .attributes({ placeholder: 'From date' })
                .label('From date'),
            nga.field('endsaledate', 'date')
                .attributes({placeholder: 'To date' })
                .label('To date'),
            nga.field('next', 'number')
                .label('Expires in (days)')
        ])
        .exportFields([
            salesreport.listView().fields(),
        ]);

    return salesreport;

}