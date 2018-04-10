export default [{
                  "title":"Dashboard",
                  "icon":'<span class="fa fa-tachometer fa-fw"></span>',
                  "children": []
                },
                {
                  "title":"Customers",
                  "icon":'<span class="fa fa-user fa-fw"></span>',
                  "children": [{
                                "entity":"CustomerGroups",
                                "title":"Customer Group",
                                "icon":'<span class="fa fa-tachometer fa-fw"></span>',
                              },{
                                "entity":"CustomerData",
                                "title":"Customer Data",
                                "icon":'<span class="fa fa-user fa-fw"></span>',
                              },{
                                "entity":"LoginData",
                                "title":"Login Data",
                                "icon":'<span class="fa fa-user-circle fa-fw"></span>',
                              }]
                },
                {
                  "title":"Subscription",
                  "icon":'<span class="fa fa-calendar-check-o fa-fw"></span>',
                  "children": []
                },
                {
                  "title":"Plans / Subscriptions",
                  "icon":'<span class="fa fa-tags fa-fw"></span>',
                  "link":"/njetstlink",
                  "children": []
                },
                {
                    "template":'<div class="menu_space">Settings</div>',
                    "children": []
                },
                {
                  "title":"Company Settings",
                  "icon":'<span class="fa fa-cog fa-fw"></span>',
                  "link":'/Settings/edit/1',
                  "children": []
                }
              ];
