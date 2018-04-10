import edit_button from '../edit_button.html';

export default function (nga, admin) {
    var paymenttransaction = admin.getEntity('PaymentTransactions');
    paymenttransaction.listView()
        .title('<h4>Payment Transactions <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
        .batchActions([])
        .fields([
            nga.field('id', 'number')
                .label('ID'),
            nga.field('transaction_id', 'string')
                .label('Transaction ID'),
            nga.field('transaction_type', 'string')
                .label('Transaction Type'),
            nga.field('transaction_token', 'string')
                .label('Transaction Token'),
            nga.field('message', 'string')
                .label('Message'),
            nga.field('customer_username', 'string')
                .label('Customer Username'),
            nga.field('product_id', 'text')
                .label('Product'),
            nga.field('payment_provider', 'string')
                .label('Payment Provider'),
            nga.field('payment_success', 'boolean')
                .label('Payment Success'),

        ])
        .listActions(['edit'])
        .exportFields([
            paymenttransaction.listView().fields(),
        ]);

    paymenttransaction.editionView()
        .title('<h4>Transaction <i class="fa fa-angle-right" aria-hidden="true"></i> Edit: {{ entry.values.username }}</h4>')
        .actions(['list'])
        .fields([
            nga.field('id', 'number')
                .editable(false)
                .label('ID'),
            nga.field('transaction_id', 'string')
                .label('Transaction ID')
                .editable(false),
            nga.field('transaction_type', 'string')
                .label('Transaction Type')
                .editable(false),
            nga.field('transaction_token', 'string')
                .editable(false)
                .label('Transaction Token'),
            nga.field('message', 'string')
                .editable(false)
                .label('Message'),
            nga.field('customer_username', 'string')
                .editable(false)
                .label('Customer Username'),
            nga.field('product_id', 'text')
                .editable(false)
                .label('Product'),
            nga.field('payment_provider', 'string')
                .editable(false)
                .label('Payment Provider'),
            nga.field('payment_success', 'boolean')
                .editable(false)
                .label('Payment Success'),
            nga.field('full_log', 'json')
                .editable(false)
                .label('Full Transaction Log'),
        ]);

   return paymenttransaction;

}
