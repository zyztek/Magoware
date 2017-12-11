import edit_button from '../edit_button.html';

export default function (nga, admin) {
    var logindata = admin.getEntity('LoginData');
    logindata.listView()
        .title('<h4>Login Accounts <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
        .batchActions([])
        .fields([
            nga.field('customer_id','reference')
                .targetEntity(admin.getEntity('CustomerData'))
                .targetField(
                    nga.field('firstname')
                        .map(function (value, entry) {
                            return entry.firstname + ' ' + entry.lastname;
                        })
                )
                .cssClasses('hidden-xs')
                .label('Customer'),
            nga.field('username')
                .isDetailLink(true)
                .label('Username'),
            nga.field('channel_stream_source_id', 'reference')
                .targetEntity(admin.getEntity('ChannelStreamSources'))
                .targetField(nga.field('stream_source'))
                .cssClasses('hidden-xs')
                .label('Channel Stream Source'),
            nga.field('vod_stream_source', 'reference')
                .targetEntity(admin.getEntity('VodStreamSources'))
                .targetField(nga.field('description'))
                .cssClasses('hidden-xs')
                .label('VOD Stream Source'),
            nga.field('pin', 'string')
                .cssClasses('hidden-xs')
                .label('Pin'),
            nga.field('activity_timeout')
                .cssClasses('hidden-xs')
                .label('Activity Time Out'),
            nga.field('timezone', 'number')
                .cssClasses('hidden-xs')
                .label('Timezone'),
            nga.field('account_lock','boolean')
                .cssClasses('hidden-xs')
                .label('Account Locked'),
            nga.field('get_messages', 'boolean')
                .label('Get messages'),
            nga.field('auto_timezone', 'boolean')
                .cssClasses('hidden-xs')
                .label('Auto Timezone'),
        ])
        .filters([
            nga.field('q')
                .label('')
                .template('<div class="input-group"><input type="text" ng-model="value" placeholder="Search" class="form-control"></input><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span></div>')
                .pinned(true)])
        .listActions(['edit'])


    logindata.creationView()
        .title('<h4>Login Accounts <i class="fa fa-angle-right" aria-hidden="true"></i> Create: Login Account</h4>')
        .onSubmitSuccess(['progression', 'notification', '$state', 'entry', 'entity', function(progression, notification, $state, entry, entity) {
            progression.done();
            $state.go($state.get('edit'), { entity: entity.name(), id: entry._identifierValue });
            return false;
        }])
        .fields([
            nga.field('customer_id', 'reference')
                .targetEntity(admin.getEntity('CustomerData'))
                .targetField(nga.field('firstnmae', 'template')
                        .map((v, e) => e.firstname + ' ' + e.lastname))
        .attributes({ placeholder: 'Select Customer' })
        .label('Customer')
        .perPage(-1)
        .validation({ required: true}),
        nga.field('username', 'string')
            .attributes({ placeholder: 'Username' })
            .label('Username')
            .validation({ required: true }),
        nga.field('password', 'password')
            .attributes({ placeholder: 'Password' })
            .label('Password')
            .validation({ required: true }),
        nga.field('channel_stream_source_id', 'reference')
            .targetEntity(admin.getEntity('ChannelStreamSources'))
            .targetField(nga.field('stream_source'))
            .attributes({ placeholder: 'Select Channel Stream Source' })
            .label('Channel Stream Source')
            .perPage(-1)
            .validation({ required: true}),
        nga.field('vod_stream_source', 'reference')
            .targetEntity(admin.getEntity('VodStreamSources'))
            .targetField(nga.field('description'))
            .attributes({ placeholder: 'Select Vod Stream Source' })
            .label('VOD Stream Source')
            .perPage(-1)
            .validation({ required: true}),
        nga.field('pin', 'string')
            .attributes({ placeholder: 'Pin' })
            .validation({ required: true })
            .label('Pin'),
        nga.field('activity_timeout', 'string')
            .attributes({ placeholder: 'Activity time out' })
            .validation({ required: true })
            .defaultValue(9000)
            .label('Activity Time Out (sec)'),
        nga.field('timezone', 'choice')
            .choices([
                { value: -12, label: '(UTC-12:00) International Date Line West' },
                { value: -11, label: '(UTC-11:00) Samoa' },
                { value: -10, label: '(UTC-10:00) Hawaii' },
                { value: -9, label: '(UTC-9:00) Alaska' },
                { value: -8, label: '(UTC-8:00) Pacific Time (US & Canada)' },
                { value: -7, label: '(UTC-7:00) Arizona, La Paz, Mazatlan' },
                { value: -6, label: '(UTC-6:00) Central America, Monterrey, Mexico City ' },
                { value: -5, label: '(UTC-5:00) Bogota, Lima, Quito, Indiana' },
                { value: -4, label: '(UTC-4:00) Atlantic Time (Canada), Manaus ' },
                { value: -3, label: '(UTC-3:00) Brasilia, Buenos Aires, Cayenne' },
                { value: -2, label: '(UTC-2:00) Mid-Atlantic' },
                { value: -1, label: '(UTC-1:00) Azores, Cape Verde Is.' },
                { value:  0, label: '(UTC 0:00) Dublin, Lisbon, London, Reykjavik' },
                { value: +1, label: '(UTC+1:00) Amsterdam, Berlin, Rome, Paris, Prague, Skopje ' },
                { value: +2, label: '(UTC+2:00) Athens, Istanbul, Cairo, Helsinki, Kyiv, Vilnius ' },
                { value: +3, label: '(UTC+3:00) Baghdad, Kuwait, Moscow, St. Petersburg, Nairobi' },
                { value: +4, label: '(UTC+4:00) Abu Dhabi, Baku, Muscat' },
                { value: +5, label: '(UTC+5:00) Ekaterinburg, Karachi, Tashkent' },
                { value: +6, label: '(UTC+6:00) Astana, Dhaka, Novosibirsk' },
                { value: +7, label: '(UTC+7:00) Bangkok, Hanoi, Jakarta' },
                { value: +8, label: '(UTC+8:00) Beijing, Hong Kong, Kuala Lumpur, Perth, Taipei' },
                { value: +9, label: '(UTC+9:00) Sapporo, Tokyo, Seoul' },
                { value: +10, label: '(UTC+10:00) Brisbane, Melbourne, Sydney' },
                { value: +11, label: '(UTC+11:00) Magadan, Solomon Is.' },
                { value: +12, label: '(UTC+12:00) Auckland, Fiji' },
            ])
            .attributes({ placeholder: 'Select Timezone' })
            .validation({ required: true })
            .label('Timezone'),
        nga.field('get_messages', 'boolean')
            .attributes({ placeholder: 'Auto Timezone' })
            .validation({ required: true})
            .label('Get messages'),
        nga.field('auto_timezone','boolean')
            .attributes({ placeholder: 'Auto Timezone' })
            .validation({ required: true})
            .label('Auto Timezone'),
        nga.field('account_lock','boolean')
            .attributes({ placeholder: 'Account Lock' })
            .label('Account Locked')
            .validation({ required: true}),
        nga.field('beta_user','boolean')
            .attributes({ placeholder: 'Is tester' })
            .label('Is tester')
            .validation({ required: true}),
        nga.field('template')
            .label('')
            .template(edit_button),
    ]);

    logindata.editionView()
        .title('<h4>Login Accounts <i class="fa fa-angle-right" aria-hidden="true"></i> Edit: {{ entry.values.username }}</h4>')
        .actions(['list'])
        .fields([
            nga.field('customer_id', 'reference')
                .targetEntity(admin.getEntity('CustomerData'))
                .targetField(nga.field('firstnmae', 'template')
                        .map((v, e) => e.firstname + ' ' + e.lastname))
        .attributes({ placeholder: 'Select Customer' })
        .label('Customer')
        .perPage(1000)
        .validation({ required: true}),
        nga.field('username', 'string')
            .attributes({ placeholder: 'Username' })
            .label('Username')
            .validation({ required: true }),
        nga.field('password', 'password')
            .attributes({ placeholder: 'Password' })
            .label('Password')
            .validation({ required: true }),
        nga.field('pin', 'string')
            .attributes({ placeholder: 'Pin' })
            .validation({ required: true })
            .label('Pin'),
        nga.field('channel_stream_source_id', 'reference')
            .targetEntity(admin.getEntity('ChannelStreamSources'))
            .targetField(nga.field('stream_source'))
            .attributes({ placeholder: 'Select Channel Stream Source' })
            .label('Channel Stream Source')
            .validation({ required: true}),
        nga.field('vod_stream_source', 'reference')
            .targetEntity(admin.getEntity('VodStreamSources'))
            .targetField(nga.field('description'))
            .attributes({ placeholder: 'Select Vod Stream Source' })
            .label('VOD Stream Source')
            .validation({ required: true}),
        nga.field('activity_timeout', 'string')
            .attributes({ placeholder: 'Activity time out' })
            .validation({ required: true })
            .defaultValue(300)
            .label('Activity Time Out'),
        nga.field('timezone', 'choice')
            .choices([
                { value: -12, label: '(UTC-12:00) International Date Line West' },
                { value: -11, label: '(UTC-11:00) Samoa' },
                { value: -10, label: '(UTC-10:00) Hawaii' },
                { value: -9, label: '(UTC-9:00) Alaska' },
                { value: -8, label: '(UTC-8:00) Pacific Time (US & Canada)' },
                { value: -7, label: '(UTC-7:00) Arizona, La Paz, Mazatlan' },
                { value: -6, label: '(UTC-6:00) Central America, Monterrey, Mexico City ' },
                { value: -5, label: '(UTC-5:00) Bogota, Lima, Quito, Indiana' },
                { value: -4, label: '(UTC-4:00) Atlantic Time (Canada), Manaus ' },
                { value: -3, label: '(UTC-3:00) Brasilia, Buenos Aires, Cayenne' },
                { value: -2, label: '(UTC-2:00) Mid-Atlantic' },
                { value: -1, label: '(UTC-1:00) Azores, Cape Verde Is.' },
                { value:  0, label: '(UTC 0:00) Dublin, Lisbon, London, Reykjavik' },
                { value: +1, label: '(UTC+1:00) Amsterdam, Berlin, Rome, Paris, Prague, Skopje ' },
                { value: +2, label: '(UTC+2:00) Athens, Istanbul, Cairo, Helsinki, Kyiv, Vilnius ' },
                { value: +3, label: '(UTC+3:00) Baghdad, Kuwait, Moscow, St. Petersburg, Nairobi' },
                { value: +4, label: '(UTC+4:00) Abu Dhabi, Baku, Muscat' },
                { value: +5, label: '(UTC+5:00) Ekaterinburg, Karachi, Tashkent' },
                { value: +6, label: '(UTC+6:00) Astana, Dhaka, Novosibirsk' },
                { value: +7, label: '(UTC+7:00) Bangkok, Hanoi, Jakarta' },
                { value: +8, label: '(UTC+8:00) Beijing, Hong Kong, Kuala Lumpur, Perth, Taipei' },
                { value: +9, label: '(UTC+9:00) Sapporo, Tokyo, Seoul' },
                { value: +10, label: '(UTC+10:00) Brisbane, Melbourne, Sydney' },
                { value: +11, label: '(UTC+11:00) Magadan, Solomon Is.' },
                { value: +12, label: '(UTC+12:00) Auckland, Fiji' },
            ])
            .attributes({ placeholder: 'Select Timezone' })
            .validation({ required: true })
            .label('Timezone'),
        nga.field('livetvlastchange', 'datetime')
            .editable(false)
            .label('Live TV Last Change'),
        nga.field('updatelivetvtimestamp', 'boolean')
            .editable(true)
            .validation({ required: true })
            .label('Update Live TV Data'),
        nga.field('vodlastchange', 'datetime')
            .editable(false)
            .label('VOD Last Change'),
        nga.field('updatevodtimestamp', 'boolean')
            .editable(true)
            .validation({ required: true })
            .label('Update VOD data'),
        nga.field('get_messages', 'boolean')
            .attributes({ placeholder: 'Auto Timezone' })
            .validation({ required: true})
            .label('Get messages'),
        nga.field('auto_timezone','boolean')
            .attributes({ placeholder: 'Auto Timezone' })
            .validation({ required: true})
            .label('Auto Timezone'),
        nga.field('account_lock','boolean')
            .attributes({ placeholder: 'Account Lock' })
            .label('Account Locked')
            .validation({ required: true}),
        nga.field('beta_user','boolean')
            .attributes({ placeholder: 'Is tester' })
            .label('Is tester')
            .validation({ required: true}),
        nga.field('template')
            .label('')
            .template(edit_button),
        nga.field('Subscriptions', 'referenced_list')
            .label('Subscription')
            .targetEntity(admin.getEntity('Subscriptions'))
            .targetReferenceField('login_id')
            .targetFields([
                nga.field('package_id', 'reference')
                    .targetEntity(admin.getEntity('Packages'))
                    .targetField(nga.field('package_name'))
                    .label('Package'),
                nga.field('package_id', 'reference')
                    .targetEntity(admin.getEntity('Packages'))
                    .targetField(nga.field('package_type_id')
                        .map(function truncate(value) {
                            if (value === 1) {
                                return 'Mobile Package';
                            } else if (value === 2) {
                                return 'STB Package';
                            }  else if (value === 3) {
                                return 'VOD Package';
                            }
                        }))
                    .label('Package Type'),
                nga.field('start_date', 'date')
                    .cssClasses('hidden-xs')
                    .template(function (entry) {
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
                    .cssClasses('hidden-xs')
                    .template(function (entry) {
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
            ]),
        nga.field('')
            .label('')
            .template('<ma-create-button entity-name="Subscriptions" class="pull-right" label="ADD SUBSCRIPTION" default-values="{ login_id: entry.values.id }"></ma-create-button>'),

        nga.field('Devices', 'referenced_list')
            .label('Devices')
            .targetEntity(admin.getEntity('Devices'))
            .targetReferenceField('login_data_id')
            .targetFields([
                nga.field('login_data_id', 'reference')
                    .targetEntity(admin.getEntity('LoginData'))
                    .targetField(nga.field('username'))
                    .label('Account'),
                nga.field('device_ip')
                    .cssClasses('hidden-xs')
                    .label('Device IP'),
                nga.field('appid')
                    .cssClasses('hidden-xs')
                    .label('App ID'),
                nga.field('app_version')
                    .cssClasses('hidden-xs')
                    .label('App Version'),
                nga.field('ntype')
                    .cssClasses('hidden-xs')
                    .label('Ntype'),
                nga.field('updatedAt','date')
                    .cssClasses('hidden-xs')
                    .label('Last Updated'),
                nga.field('device_brand')
                    .cssClasses('hidden-xs')
                    .label('Device Brand'),
                nga.field('device_active','boolean')
                    .label('Device Active'),
            ])
            .listActions(['edit']),

        nga.field('Salesreports', 'referenced_list')
            .label('Sale Reports')
            .targetEntity(nga.entity('Salesreports'))
            .targetReferenceField('login_data_id')
            .targetFields([
                nga.field('user_username', 'string')
                    .label('User Username'),
                nga.field('distributorname', 'string')
                    .cssClasses('hidden-xs')
                    .label('Distributor Name'),
                nga.field('saledate', 'date')
                    .cssClasses('hidden-xs')
                    .label('Sale Date'),
                nga.field('combo_id', 'reference')
                    .targetEntity(admin.getEntity('Combos'))
                    .targetField(nga.field('name'))
                    .label('Product'),
            ])
    ]);

    return logindata;
}