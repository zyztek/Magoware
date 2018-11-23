export default [{
    "title":"Dashboard",
    "icon":'<span class="fa fa-tachometer fa-fw"></span>',
    "group_roles":["admin","administrator","customercare","management","guest"],
    "children": [],
    "link":'/dashboard'
},
    {
        "template":'<div class="menu_space">Customers / Users</div>',
        "group_roles":["admin","administrator","customercare","management","guest"],
        "children": []
    },
    {
        "title":"Customers",
        "icon":'<span class="fa fa-user fa-fw"></span>',
        "group_roles":["admin","administrator","customercare","management","guest"],
        "children": [{
            "entity":"CustomerGroups",
            "title":"Customer Group",
            "icon":'<span class="fa fa-users fa-fw"></span>',
            "link":'/CustomerGroups/list',
            "group_roles":["admin","administrator","customercare","management","guest"]
        },{
            "entity":"CustomerData",
            "title":"Customer",
            "icon":'<span class="fa fa-user fa-fw"></span>',
            "link":'/CustomerData/list',
            "group_roles":["admin","administrator","customercare","management","guest"]
        },{
            "entity":"LoginData",
            "title":"Login Accounts",
            "icon":'<span class="fa fa-user-circle fa-fw"></span>',
            "link":'/LoginData/list',
            "group_roles":["admin","administrator","customercare","management","guest"]
        },{
            "entity":"Devices",
            "title":"Devices",
            "icon":'<span class="fa fa-mobile fa-fw"></span>',
            "link":'/Devices/list',
            "group_roles":["admin","administrator","customercare","management","guest"]
        }]
    },
    {
        "title":"System Users",
        "icon":'<span class="fa fa-users fa-fw"></span>',
        "group_roles":["admin","administrator","customercare","management","guest"],
        "children": [{
            "entity":"Groups",
            "title":"User Groups",
            "icon":'<span class="fa fa-users fa-fw"></span>',
            "link":'/Groups/list',
            "group_roles":["admin","administrator","customercare","management","guest"]
        },{
            "entity":"Users",
            "title":"Users",
            "icon":'<span class="fa fa-user fa-fw"></span>',
            "link":'/Users/list',
            "group_roles":["admin","administrator","management","guest"]
        }]
    },
    {
        "template":'<div class="menu_space">Sales</div>',
        "group_roles":["admin","administrator","customercare","management","guest"],
        "children": []
    },
    {
        "title":"Subscription",
        "icon":'<span class="fa fa-calendar-check-o fa-fw"></span>',
        "group_roles":["admin","administrator","customercare","management","guest"],
        "children": [],
        "link":'/Subscriptions/list'
    },
    {
        "title":"Reports",
        "icon":'<span class="fa fa-list fa-fw"></span>',
        "group_roles":["admin","administrator","finance","customercare","management","guest"],
        "children": [{
            "entity":"Salesreports",
            "title":"Sales export",
            "icon":'<span class="fa fa-list fa-fw"></span>',
            "link":'/Salesreports/list',
            "group_roles":["admin","administrator","finance","customercare","management","guest"]
        },{
            "entity":"sales_by_product",
            "title":"Product Sales",
            "icon":'<span class="fa fa-list fa-fw"></span>',
            "link":'/sales_by_product/list',
            "group_roles":["admin","administrator","finance","customercare","management","guest"]
        },{
            "entity":"sales_by_date",
            "title":"Sales By Day",
            "icon":'<span class="fa fa-list fa-fw"></span>',
            "link":'/sales_by_date/list',
            "group_roles":["admin","administrator","finance","customercare","management","guest"]
        },{
            "entity":"sales_by_month",
            "title":"Sales By Month",
            "icon":'<span class="fa fa-list fa-fw"></span>',
            "link":'/sales_by_month/list',
            "group_roles":["admin","administrator","finance","customercare","management","guest"]
        },{
            "entity":"sales_monthly_expiration",
            "title":"Account Expiration By Month",
            "icon":'<span class="fa fa-list fa-fw"></span>',
            "link":'/sales_monthly_expiration/list',
            "group_roles":["admin","administrator","finance","customercare","management","guest"]
        },{
            "entity":"sales_by_expiration",
            "title":"Expirations List",
            "icon":'<span class="fa fa-list fa-fw"></span>',
            "link":'/sales_by_expiration/list',
            "group_roles":["admin","administrator","finance","customercare","management","guest"]
        },{
            "entity":"",
            "title":"Expiration Next 30 Days",
            "icon":'<span class="fa fa-list fa-fw"></span>',
            "link":'/sales_by_expiration/list?search=%7B%22next%22:%2230%22%7D',
            "group_roles":["admin","administrator","finance","customercare","management","guest"]
        }]
    },
    {
        "entity":"Combos",
        "title":"Products / Plans",
        "icon":'<span class="fa fa-tags fa-fw"></span>',
        "link":'/Combos/list',
        "group_roles":["admin","administrator","customercare","management","guest"],
        "children": []
    },
    {
        "template":'<div class="menu_space">Settings</div>',
        "group_roles":["admin","administrator","customercare","management","guest"],
        "children": []
    },
    {
        "title":"Company Settings",
        "icon":'<span class="fa fa-cog fa-fw"></span>',
        "group_roles":["admin","administrator","customercare","management","guest"],
        "children": [{
            "entity":"EmailSettings",
            "title":"Email Settings",
            "icon":'<span class="fa fa-envelope-o fa-fw"></span>',
            "link":'/EmailSettings/edit/1',
            "group_roles":["admin","administrator","customercare","management","guest"]
        },{
            "entity":"PlayerSettings",
            "title":"Player Settings",
            "icon":'<span class="fa fa-play fa-fw"></span>',
            "link":'/PlayerSettings/edit/1',
            "group_roles":["admin","administrator","customercare","management","guest"]
        },{
            "entity":"LogosImages",
            "title":"Logos and Images",
            "icon":'<span class="fa fa-picture-o fa-fw"></span>',
            "link":'/ImagesSettings/edit/1',
            "group_roles":["admin","administrator","customercare","management","guest"]
        },{
            "entity":"URL",
            "title":"URLs",
            "icon":'<span class="fa fa-link fa-fw"></span>',
            "link":'/URL/edit/1',
            "group_roles":["admin","administrator","customercare","management","guest"]
        },{
            "entity":"ApiKeys",
            "title":"Api Keys",
            "icon":'<span class="fa fa-key fa-fw"></span>',
            "link":'/ApiKeys/edit/1',
            "group_roles":["admin","administrator","customercare","management","guest"]
        },
            {
                "entity":"Settings",
                "title":"Other",
                "icon":'<span class="fa fa-cog fa-fw"></span>',
                "link":'/Settings/edit/1',
                "group_roles":["admin","administrator","customercare","management","guest"]
            }]
    },
    {
        "title":"Advanced Settings",
        "icon":'<span class="fa fa-cog fa-fw"></span>',
        "link":'/AdvancedSettings/list',
        "group_roles":["admin","administrator","customercare","management","guest"],
        "children": []
    },
    {
        "entity":"DeviceMenus",
        "title":"Main Menu",
        "icon":'<span class="fa fa-align-justify fa-fw"></span>',
        "link":'/DeviceMenus/list',
        "group_roles":["admin","administrator","customercare","management","guest"],
        "children": []
    },
    {
        "entity":"Submenu",
        "title":"Submenu",
        "icon":'<span class="fa fa-align-justify fa-fw"></span>',
        "link":'/Submenu/list',
        "group_roles":["admin","administrator","customercare","management","guest"],
        "children": []
    },
    {
        "template":'<div class="menu_space">TV / VOD</div>',
        "group_roles":["admin","administrator","customercare","management","guest"],
        "children": []
    },
    // {
    //     "entity":"SystemMenu",
    //     "title":"System Menu",
    //     "icon":'<span class="fa fa-align-justify fa-fw"></span>',
    //     "link":'/SystemMenu/list',
    //     "group_roles":["admin","administrator","customercare","management"],
    //     "children": []
    // },
    {
        "title":"TV Channels",
        "icon":'<span class="fa fa-television fa-fw"></span>',
        "group_roles":["admin","administrator","customercare","management","guest"],
        "children": [{
            "entity":"Genres",
            "title":"Categories / Genre",
            "icon":'<span class="fa fa-folder-open fa-fw"></span>',
            "link":'/Genres/list',
            "group_roles":["admin","administrator","customercare","management","guest"]
        },{
            "entity":"Channels",
            "title":"Channels / Streams",
            "icon":'<span class="fa fa-television fa-fw"></span>',
            "link":'/Channels/list',
            "group_roles":["admin","administrator","customercare","management","guest"]
        },
        {
            "entity":"Channels",
            "title":"Not Active Channels",
            "icon":'<span class="fa fa-times-circle-o fa-fw"></span>',
            "link":'/Channels/list?search=%7B"isavailable":false%7D',
            "group_roles":["admin","administrator","customercare","management","guest"]
        },
        {
            "entity":"ChannelStreamSources",
            "title":"Live TV Stream Source",
            "icon":'<span class="fa fa-signal fa-fw"></span>',
            "link":'/ChannelStreamSources/list',
            "group_roles":["admin","administrator","customercare","management","guest"]
        },{
            "entity":"livepackages",
            "title":"Channel Packages",
            "icon":'<span class="fa fa-th fa-fw"></span>',
            "link":'/livepackages/list',
            "group_roles":["admin","administrator","customercare","management","guest"]
        }]
    },
    {
        "title":"VOD",
        "icon":'<span class="fa fa-film fa-fw"></span>',
        "group_roles":["admin","administrator","vod","management","guest"],
        "children": [{
            "entity":"VodCategories",
            "title":"VOD Categories",
            "icon":'<span class="fa fa-folder-open fa-fw"></span>',
            "link":'/VodCategories/list',
            "group_roles":["admin","administrator","vod","management","guest"]
        },{
            "entity":"Vods",
            "title":"VOD Movies",
            "icon":'<span class="fa fa-film fa-fw"></span>',
            "link":'/Vods/list?search=%7B"pin_protected":"0"%7D',
            "group_roles":["admin","administrator","vod","management","guest"]
        },
            {
                "entity":"vodMenu",
                "title":"VOD Menu",
                "icon":'<span class="fa fa-film fa-fw"></span>',
                "link":'/vodMenu/list',
                "group_roles":["admin","administrator","vod","management","guest"]
            },
            {
                "entity":"vodMenuCarousel",
                "title":"VOD Menu Carousel",
                "icon":'<span class="fa fa-film fa-fw"></span>',
                "link":'/vodMenuCarousel/list',
                "group_roles":["admin","administrator","vod","management","guest"]
            },
        {
            "entity":"Vods",
            "title":"Not Active VOD Movies",
            "icon":'<span class="fa fa-times-circle-o fa-fw"></span>',
            "link":'/Vods/list?search=%7B"isavailable":false%7D',
            "group_roles":["admin","administrator","vod","management","guest"]
        },
            {
                "entity":"Series",
                "title":"TV Shows",
                "icon":'<span class="fa fa-film fa-fw"></span>',
                "link":'/Series/list',
                "group_roles":["admin","administrator","vod","management","guest"]
            },
            {
                "entity":"Season",
                "title":"Season",
                "icon":'<span class="fa fa-film fa-fw"></span>',
                "link":'/Season/list',
                "group_roles":["admin","administrator","vod","management","guest"]
            },
            {
                "entity":"VodEpisode",
                "title":"Episodes",
                "icon":'<span class="fa fa-film fa-fw"></span>',
                "link":'/VodEpisode/list',
                "group_roles":["admin","administrator","vod","management","guest"]
            },

        {
            "entity":"VodStreamSources",
            "title":"VOD Stream Source",
            "icon":'<span class="fa fa-signal fa-fw"></span>',
            "link":'/VodStreamSources/list',
            "group_roles":["admin","administrator","vod","management","guest"]
        },{
            "entity":"vodPackages",
            "title":"VOD Packages",
            "icon":'<span class="fa fa-th fa-fw"></span>',
            "link":'/vodPackages/list',
            "group_roles":["admin","administrator","vod","management","guest"]
        }]
    },
    {
        "title":"EPG",
        "icon":'<span class="fa fa-map-o fa-fw"></span>',
        "group_roles":["admin","administrator","epg","management","guest"],
        "children": [{
            "entity":"epgimport",
            "title":"EPG Import",
            "icon":'<span class="fa fa-map-o fa-fw"></span>',
            "link":'/epgimport/create',
            "group_roles":["admin","administrator","epg","management","guest"]
        },{
            "entity":"EpgData",
            "title":"EPG Data",
            "icon":'<span class="fa fa-list fa-fw"></span>',
            "link":'/EpgData/list',
            "group_roles":["admin","administrator","epg","management","guest"]
        },{
            "entity":"",
            "title":"EPG Graph",
            "icon":'<span class="fa fa-bar-chart fa-fw"></span>',
            "link":'/epggraph',
            "group_roles":["admin","administrator","epg","management","guest"]
        }]
    },
    {
        "template":'<div class="menu_space">Other</div>',
        "group_roles":["admin","administrator","customercare","management","guest"],
        "children": []
    },
    {
        "entity":"appgroup",
        "title":"APP Group",
        "icon":'<span class="fa fa-file fa-fw"></span>',
        "link":'/appgroup/list',
        "group_roles":["admin","administrator","customercare","management","guest"],
        "children": []
    },
    {
        "entity":"EmailTemplate",
        "title":"Email Template",
        "icon":'<span class="fa fa-envelope fa-fw"></span>',
        "link":'/EmailTemplate/list',
        "group_roles":["admin","administrator","customercare","management","guest"],
        "children": []
    },

    {
        "entity":"htmlContent",
        "title":"HTML Content",
        "icon":'<span class="fa fa-code fa-fw"></span>',
        "link":'/htmlContent/list',
        "group_roles":["admin","administrator","customercare","management","guest"],
        "children": []
    },

    {
        "entity":"appmanagement",
        "title":"APP Management",
        "icon":'<span class="fa fa-upload fa-fw"></span>',
        "link":'/appmanagement/list',
        "group_roles":["admin","administrator","customercare","management","guest"],
        "children": []
    },
    {
        "entity":"mychannels",
        "title":"My Channels",
        "icon":'<span class="fa fa-tv fa-fw"></span>',
        "link":'/mychannels/list',
        "group_roles":["admin","administrator","customercare","management","guest"],
        "children": []
    },
    {
        "entity":"logs",
        "title":"Logs",
        "icon":'<span class="fa fa-book fa-fw"></span>',
        "link":'/logs/list',
        "group_roles":["admin","administrator","customercare","management","guest"],
        "children": []
    },
    {
        "entity":"PaymentTransactions",
        "title":"Payment Transaction",
        "icon":'<span class="fa fa-book fa-fw"></span>',
        "link":'/PaymentTransactions/list',
        "group_roles":["admin","administrator","customercare","management","guest"],
        "children": []
    },
    {
        "title":"Push messages",
        "icon":'<span class="fa fa-envelope fa-fw"></span>',
        "group_roles":["admin","administrator","customercare","management","guest"],
        "children": [{
            "entity":"messages",
            "title":"Push notifications",
            "icon":'<span class="fa fa-bell fa-fw"></span>',
            "link":'/messages/list',
            "group_roles":["admin","administrator","customercare","management","guest"]
        },{
            "entity":"commands",
            "title":"Commands",
            "icon":'<span class="fa fa-terminal fa-fw"></span>',
            "link":'/commands/list',
            "group_roles":["admin","administrator","customercare","guest"]
        },{
            "entity":"ads",
            "title":"Ads",
            "icon":'<span class="fa fa-buysellads fa-fw"></span>',
            "link":'/ads/list',
            "group_roles":["admin","administrator","customercare","management","guest"]
        }]
    },
    {
        "entity":"",
        "title":"HELP",
        "icon":'<span class="fa fa-question-circle fa-fw"></span>',
        "link":'/dashboard',
        "group_roles":["admin","administrator","customercare","management","guest"],
        "children": []
    },
    {
        "title":"My Dashboard",
        "icon":'<span class="fa fa-tachometer fa-fw"></span>',
        "group_roles":["resellers"],
        "children": [],
        "link":'/dashboard'
    },
    {
        "title":"Search Customers",
        "icon":'<span class="fa fa-search fa-fw"></span>',
        "group_roles":["resellers"],
        "children": [],
        "link":'/search_customer/list'
    },
    {
        "title":"Add Subscription",
        "icon":'<span class="fa fa-calendar-check-o fa-fw"></span>',
        "group_roles":["resellers"],
        "children": [],
        "link":'/MySubscription/create'
    },
    {
        "title":"Add New Customer",
        "icon":'<span class="fa fa-users fa-fw"></span>',
        "group_roles":["resellers"],
        "children": [],
        "link":'/NewCustomer/create'
    },
    {
        "title":"My Sales",
        "icon":'<span class="fa fa-list fa-fw"></span>',
        "group_roles":["resellers"],
        "children": [],
        "link":'/MySales/list?search=%7B"distributorname":"'+localStorage.userName+'"%7D'
    }
];