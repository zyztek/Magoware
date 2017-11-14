export default function (nga, admin) {

    return nga.menu()
        .addChild(nga.menu()
            .title('Dashboard')
            .icon('<span class="fa fa-tachometer fa-fw"></span>')
        )

        .addChild(nga.menu()
                    .title('Customers')
                    .icon('<span class="fa fa-user fa-fw"></span>')

                        .addChild(nga.menu(admin.getEntity('CustomerGroups'))
                            .title('Customer Group')
                            .icon('<span class="fa fa-users fa-fw"></span>')
                        )

                        .addChild(nga.menu(admin.getEntity('CustomerData'))
                            .title('Customer')
                            .icon('<span class="fa fa-user fa-fw"></span>')
                        )
                        .addChild(nga.menu(admin.getEntity('LoginData'))
                            .title('Login Accounts')
                            .icon('<span class="fa fa-user-plus fa-fw"></span>')
                        )

                        .addChild(nga.menu(admin.getEntity('Devices'))
                            .title('Devices')
                            .icon('<span class="fa fa-outdent fa-fw"></span>')
                        )

                )

        .addChild(nga.menu(admin.getEntity('Subscriptions'))
            .title('Subscriptions')
            .icon('<span class="fa fa-calendar-check-o fa-fw"></span>')
        )


        .addChild(nga.menu()
                    .title('Reports')
                    .icon('<span class="fa fa-list fa-fw"></span>')

                        .addChild(nga.menu(admin.getEntity('Salesreports'))
                            .title('Sales export')
                            .icon('<span class="fa fa-list fa-fw"></span>')
                        )
                        .addChild(nga.menu(admin.getEntity('sales_by_product'))
                            .title('Product sales')
                            .icon('<span class="fa fa-list fa-fw"></span>')
                        )
                        .addChild(nga.menu(admin.getEntity('sales_by_date'))
                            .title('Sales by day')
                            .icon('<span class="fa fa-list fa-fw"></span>')
                        )
                        .addChild(nga.menu(admin.getEntity('sales_by_month'))
                            .title('Sales by month')
                            .icon('<span class="fa fa-list fa-fw"></span>')
                        )
                        .addChild(nga.menu(admin.getEntity('sales_by_expiration'))
                            .title('Expirations list')
                            .icon('<span class="fa fa-list fa-fw"></span>')
                        )
                )


        .addChild(nga.menu(admin.getEntity('Combos'))
            .title('Products / Plans')
            .icon('<span class="fa fa-tags fa-fw"></span>')
        )


        .addChild(nga.menu()
            .template('<div class="menu_space">Settings</div>')
        )

        .addChild(nga.menu(admin.getEntity('Settings'))
            .title('Company Settings')
            .link('/Settings/edit/1')
            .icon('<span class="fa fa-cog fa-fw"></span>')
        )


        .addChild(nga.menu(admin.getEntity('DeviceMenus'))
            .title('Main Menu')
            .icon('<span class="fa fa-align-justify fa-fw"></span>')
        )




        .addChild(nga.menu()
            .title('TV Channels')
            .icon('<span class="fa fa-television fa-fw"></span>')

                .addChild(nga.menu(admin.getEntity('Genres'))
                    .title('Categories / Genre')
                    .icon('<span class="fa fa-folder-open fa-fw"></span>')
                )
        
                .addChild(nga.menu(admin.getEntity('Channels'))
                    .title('Channels / Streams')
                    .icon('<span class="fa fa-television fa-fw"></span>')
                )
            .addChild(nga.menu(admin.getEntity('ChannelStreamSources'))
                .title('Live TV Stream Source')
                .icon('<span class="fa fa-signal fa-fw"></span>')
            )
                .addChild(nga.menu(admin.getEntity('livepackages'))
                    .title('Channel Packages')
                    .icon('<span class="fa fa-th fa-fw"></span>')
        		)
        )

        .addChild(nga.menu()
            .title('VOD')
            .icon('<span class="fa fa-film fa-fw"></span>')

                .addChild(nga.menu(admin.getEntity('VodCategories'))
                    .title('VOD Categories')
                    .icon('<span class="fa fa-folder-open fa-fw"></span>')
                )

                .addChild(nga.menu(admin.getEntity('Vods'))
                    .title('VOD Movies')
                    .icon('<span class="fa fa-film fa-fw"></span>')
                )
            .addChild(nga.menu(admin.getEntity('VodStreamSources'))
                .title('VOD Stream Source')
                .icon('<span class="fa fa-signal fa-fw"></span>')
            )
               	.addChild(nga.menu(admin.getEntity('vodPackages'))
                    .title('VOD Packages')
                    .icon('<span class="fa fa-th fa-fw"></span>')
        		)
        )

        .addChild(nga.menu()
            .title('EPG').icon('<span class="fa fa-film fa-fw"></span>')
            .addChild(nga.menu(admin.getEntity('epgimport'))
                .title('EPG Import')
                .icon('<span class="fa fa-film fa-fw"></span>')
            )
            .addChild(nga.menu(admin.getEntity('EpgData'))
                .title('EPG Data')
                .icon('<span class="fa fa-folder-open fa-fw"></span>')
            )
            .addChild(nga.menu()
                .title('EPG Graph')
                .icon('<span class="fa fa-tachometer fa-fw"></span>')
                .link('/epggraph')
            )
        )


        .addChild(nga.menu(admin.getEntity('appgroup'))
            .title('APP Group')
            .icon('<span class="fa fa-file fa-fw"></span>')
        )

        .addChild(nga.menu()
            .title('System Users')
            .icon('<span class="fa fa-users fa-fw"></span>')

            .addChild(nga.menu(admin.getEntity('Groups'))
                .title('User Groups')
                .icon('<span class="fa fa-users fa-fw"></span>')
            )
                .addChild(nga.menu(admin.getEntity('Users'))
                    .title('Users')
                    .icon('<span class="fa fa-user fa-fw"></span>')
                )
        )

        .addChild(nga.menu()
            .template('<div class="menu_space">Other</div>')
        )

         .addChild(nga.menu(admin.getEntity('appmanagement'))
            .title('APP Management')
            .icon('<span class="fa fa-sign-in fa-fw"></span>')
        )

        .addChild(nga.menu(admin.getEntity('mychannels'))
            .title('My Channels')
            .icon('<span class="fa fa-sign-in fa-fw"></span>')
        )

        .addChild(nga.menu(admin.getEntity('logs'))
            .title('Logs')
            .icon('<span class="fa fa-sign-in fa-fw"></span>')
        )

        .addChild(nga.menu(admin.getEntity('messages'))
            .title('Push notifications')
            .icon('<span class="fa fa-sign-in fa-fw"></span>')
        )

        .addChild(nga.menu()
            .title('HELP')
            .icon('<span class="fa fa-question-circle fa-fw"></span>')
        )

    ;



}
