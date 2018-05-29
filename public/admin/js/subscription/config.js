import edit_button from '../edit_button.html';

export default function (nga, admin){
	var subscription = admin.getEntity('Subscriptions');
	subscription.listView()
		.title('<h4>Subscriptions <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
		.batchActions([])
		.fields([
			nga.field('login_id', 'reference')
				.targetEntity(admin.getEntity('LoginData'))
                .targetField(nga.field('username'))
				.label('Login'),
			nga.field('package_id', 'reference')
				.targetEntity(admin.getEntity('Packages'))
                .targetField(nga.field('package_name'))
				.label('Packages'),
			nga.field('start_date', 'date')
				.template(function (entry, values) {
					var moment = new Date().toISOString().slice(0,10);
					var ng_vlera_start = new Date(entry.values.start_date).toISOString().slice(0,10);
					var ng_vlera_end = new Date(entry.values.end_date).toISOString().slice(0,10);
						if ((moment >= ng_vlera_start) && (moment <= ng_vlera_end)) {
							return ng_vlera_start.fontcolor("green");
						} else {
							return ng_vlera_start.fontcolor("red").bold();
						}

				})
				.label('Start Date'),
			nga.field('end_date', 'date')
				.template(function (entry, values) {
					var moment = new Date().toISOString().slice(0,10);
					var ng_vlera_start = new Date(entry.values.start_date).toISOString().slice(0,10);
					var ng_vlera_end = new Date(entry.values.end_date).toISOString().slice(0,10);
						if ((moment >= ng_vlera_start) && (moment <= ng_vlera_end)) {
							return ng_vlera_end.fontcolor("green");
						} else {
							return ng_vlera_end.fontcolor("red").bold();
						}

				})
				.label('End Date'),
		]).listActions(['edit'])
        .filters([
          	nga.field('q')
				.template('<div class="input-group"><input type="text" ng-model="value" placeholder="Search" class="form-control"></input><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span></div>')
              	.label('')
               	.pinned(true)
        	])
        .exportFields([
         subscription.listView().fields(),
        ]);


	subscription.deletionView()
		.title('<h4>Subscriptions <i class="fa fa-angle-right" aria-hidden="true"></i> Remove <span style ="color:red;"> {{ entry.values.package.package_name }} </span> from <span style ="color:red;"> {{ entry.values.login_datum.username }} </span></h4>')
		.fields([
			nga.field('login_datum', 'template')
					.template(function (entry, value) {
						return entry.values.login_datum.username;
			}),
			nga.field('package', 'template')
					.template(function (entry, value) {
						return entry.values.package.package_name;
			}),
		])
		.actions(['<ma-back-button entry="entry" entity="entity"></ma-back-button>'])


    subscription.creationView()
        .title('<h4>Subscriptions <i class="fa fa-angle-right" aria-hidden="true"></i> Create: Subscription</h4>')
        .fields([
            nga.field('login_id', 'reference')
                .targetEntity(admin.getEntity('LoginData'))
                .targetField(nga.field('username'))
                .attributes({ placeholder: 'Choose from the dropdown list username' })
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
                .attributes({ placeholder: 'Choose from the dropdown list Combo' })
                .validation({ required: true })
                .perPage(-1)
                .label('Combo'),
            nga.field('start_date','date')
                .attributes({ placeholder: 'Start Date' })
                .validation({ required: true })
                .defaultValue(new Date())
                .label('Start Date'),
            nga.field('template')
                .label('')
                .template(edit_button),
        ])
        .onSubmitSuccess(['progression', 'notification', '$state', 'entry', 'entity', function(progression, notification, $state, entry, entity) {
            console.log(entry);
            progression.done();
            $state.go($state.get('edit'), {entity: 'LoginData', id: entry.values.user});
            return false;
        }]);

    subscription.editionView() 
    	.title('<h4>Subscriptions: Edit subscription date <i class="fa fa-angle-right" aria-hidden="true"></i></h4>')
        .fields([
			nga.field('login_id', 'reference')
					.targetEntity(admin.getEntity('LoginData'))
					.targetField(nga.field('username'))
					.attributes({ placeholder: 'Select Account' })
					.validation({ required: true })
					.label('Username'),
			nga.field('start_date','date')
					.validation({ required: true, validator: function(start_date_input, input_list){
						if (start_date_input > input_list.end_date) throw new Error ('Start date cannot be bigger than end date')}
					})
					.label('Start date'),
			nga.field('end_date','date')
					.validation({ required: true, validator: function(end_date_input, input_list){
						if (end_date_input < input_list.start_date) throw new Error ('End date cannot be smaller than start date')}
					})
					.label('End date'),
			nga.field('template')
					.label('')
					.template(edit_button),
        ]).onSubmitSuccess(['progression', 'notification', '$state', 'entry', 'entity', function(progression, notification, $state, entry, entity) {
			progression.done();
			$state.go($state.get('list'), { entity: entity.name() });
			return false;
		}]);

	return subscription;
	
}
