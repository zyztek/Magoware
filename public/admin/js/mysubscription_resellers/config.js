import edit_button from '../edit_button.html';

export default function (nga, admin){
    var mysubscription = admin.getEntity('MySubscription');

    mysubscription.creationView()
        .title('<h4>Subscriptions <i class="fa fa-angle-right" aria-hidden="true"></i> Create: Subscription</h4>')
        .fields([
            nga.field('login_id', 'reference')
                .targetEntity(admin.getEntity('LoginData'))
                .targetField(nga.field('username'))
                .attributes({ placeholder: 'Choose Username from dropdown list' })
                .validation({ required: true })
                .perPage(-1)
                .remoteComplete(true, {
                    refreshDelay: 300,
                    // populate choices from the response of GET /posts?q=XXX
                    searchQuery: function(search) { return { q: search }; }
                })
                .perPage(10) // limit the number of results to 10
                .label('Username'),
            nga.field('combo_id', 'reference')
                .targetEntity(admin.getEntity('Combos'))
                .targetField(nga.field('name'))
                .attributes({ placeholder: 'Choose Combo from dropdown list' })
                .validation({ required: true })
                .perPage(-1)
                .label('Combo'),
            nga.field('on_behalf_id','reference')
                .targetEntity(admin.getEntity('Users'))
                .targetField(nga.field('username'))
                .label('On Behalf Id'),
            nga.field('start_date','date')
                .attributes({ placeholder: 'Start date' })
                .validation({ required: true })
                .defaultValue(new Date())
                .label('Start date'),
            nga.field('template')
                .label('')
                .template(edit_button),
        ])
        .onSubmitSuccess(['progression', 'notification', '$state', 'entry', 'entity', function(progression, notification, $state, entry, entity) {
            progression.done();
            notification.log('Subscription successfully created.', { addnCls: 'humane-flatty-success' });
            window.location.replace('#/MySales/list?search=%7B"distributorname":"'+localStorage.userName+'"%7D');
            return false;
        }]);



    return mysubscription;

}
