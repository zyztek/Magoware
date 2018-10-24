import edit_button from '../edit_button.html';

export default function (nga, admin) {
    var mysales = admin.getEntity('MySales');

    mysales.listView()
        // .url(function() {
        //     return 'MySales/list';
        // })
        .title('<h4>Sale report <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
        .listActions(['<ma-edit-button entry="entry" entity="entity" label="Cancel Subscription" size="xs"></ma-edit-button><download-invoice post="entry"></download-invoice>'])
        .batchActions([])
        .fields([
            nga.field('id', 'number')
                .cssClasses('hidden-xs')
                .label('ID'),
            nga.field('user_id', 'reference')
                .targetEntity(admin.getEntity('ResellersUsers'))
                .targetField(nga.field('username'))
                .label('Sales Agent'),

            nga.field('login_data_id', 'reference')
                .targetEntity(admin.getEntity('ResellersLoginData'))
                .targetField(nga.field('username'))
                .label('Account Username'),

            nga.field('transaction_id', 'string')
                .label('Transaction ID')
                .editable(false),


            nga.field('saledate', 'date')
                .cssClasses('hidden-xs')
                .label('Sale Date'),
            nga.field('combo.name', 'string')
                .label('Products'),
            nga.field('active', 'boolean')
                .label('Active sale'),
            nga.field('cancelation_date', 'date')
                .cssClasses('hidden-xs')
                .label('Cancelation Date'),
            nga.field('cancelation_user', 'reference')
                .targetEntity(admin.getEntity('ResellersUsers'))
                .targetField(nga.field('username'))
                .label('Cancelation User'),
            nga.field('cancelation_reason', 'text')
                .cssClasses('hidden-xs')
                .label('Cancelation Reason'),

        ]).filters([
        nga.field('user_username')
            .attributes({ placeholder: 'Client' })
            .label('Client'),
        // nga.field('distributorname')
        //     .attributes({ placeholder: 'Distributor' })
        //     .label('Distributor'),
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
            mysales.listView().fields(),
        ]);

    mysales.editionView()
        .title('<h4>Transaction <i class="fa fa-angle-right" aria-hidden="true"></i> Edit: {{ entry.values.username }}</h4>')
        .actions(['list'])
        .fields([
            nga.field('id', 'number')
                .editable(false)
                .label('ID'),
            nga.field('transaction_id', 'string')
                .label('Transaction ID')
                .editable(false),
            /*
            nga.field('active', 'boolean')
                    .attributes({readOnly: true})
                    .defaultValue(true)
                    .validation({ required: true })
                .label('Cancel Sale'),
            */
            nga.field('cancelation_reason', 'string')
                .label('Cancelation Reason')
                .editable(true)
                .validation({ required: true}),
            nga.field('template')
                .label('')
                .template(edit_button),

        ]);

    return mysales;

}
