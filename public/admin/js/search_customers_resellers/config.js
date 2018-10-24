import edit_button from '../edit_button.html';

export default function (nga, admin) {
    var search_customer = admin.getEntity('search_customer');


    search_customer.listView()
        .title('<h4>Search Customers <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
        .batchActions([])
        .fields([

            nga.field('username')
                .label('Username'),
            nga.field('customer_datum.firstname')
                .label('Firstname'),
            nga.field('customer_datum.lastname')
                .label('Lastname'),
            nga.field('customer_datum.email')
                .label('Email'),
            nga.field('customer_datum.address')
                .label('Address'),
            nga.field('subscription_status')
                .label('Subscription Status'),
            nga.field('')
                .label('')
                .template('<ma-create-button entity-name="MySubscription" class="pull-right" label="ADD SUBSCRIPTION" default-values="{ login_id: entry.values.id }"></ma-create-button>'),

        ])
        .filters([
            nga.field('q')
                .label('')
                .template('<div class="input-group"><input type="text" ng-model="value" placeholder="Search" class="form-control"><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span></div>')
                .pinned(true),
            nga.field('firstname')

                .label('firstname')

        ]);
    return search_customer;
}