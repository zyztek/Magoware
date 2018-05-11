export default [{
    "title":"Dashboard",
    "icon":'<span class="fa fa-tachometer fa-fw"></span>',
    "group_roles":["admin","administrator","customercare","management"],
    "children": [],
    "link":'/dashboard'
},
    {
        "title":"Customers",
        "icon":'<span class="fa fa-user fa-fw"></span>',
        "group_roles":["admin","administrator","customercare","management"],
        "children": [{
            "entity":"CustomerGroups",
            "title":"Customer Group",
            "icon":'<span class="fa fa-users fa-fw"></span>',
            "link":'/CustomerGroups/list',
            "group_roles":["admin","administrator","customercare","management"]
        },{
            "entity":"CustomerData",
            "title":"Customer",
            "icon":'<span class="fa fa-user fa-fw"></span>',
            "link":'/CustomerData/list',
            "group_roles":["admin","administrator","customercare","management"]
        },{
            "entity":"LoginData",
            "title":"Login Accounts",
            "icon":'<span class="fa fa-user-circle fa-fw"></span>',
            "link":'/LoginData/list',
            "group_roles":["admin","administrator","customercare","management"]
        },{
            "entity":"Devices",
            "title":"Devices",
            "icon":'<span class="fa fa-mobile fa-fw"></span>',
            "link":'/Devices/list',
            "group_roles":["admin","administrator","customercare","management"]
        }]
    },
    {
        "title":"Subscription",
        "icon":'<span class="fa fa-calendar-check-o fa-fw"></span>',
        "group_roles":["admin","administrator","customercare","management"],
        "children": [],
        "link":'/Subscriptions/list'
    },
    {
        "title":"Reports",
        "icon":'<span class="fa fa-list fa-fw"></span>',
        "group_roles":["admin","administrator","finance","customercare","management"],
        "children": [{
            "entity":"Salesreports",
            "title":"Sales export",
            "icon":'<span class="fa fa-list fa-fw"></span>',
            "link":'/Salesreports/list',
            "group_roles":["admin","administrator","finance","customercare","management"]
        },{
            "entity":"sales_by_product",
            "title":"Product Sales",
            "icon":'<span class="fa fa-list fa-fw"></span>',
            "link":'/sales_by_product/list',
            "group_roles":["admin","administrator","finance","customercare","management"]
        },{
            "entity":"sales_by_date",
            "title":"Sales By Day",
            "icon":'<span class="fa fa-list fa-fw"></span>',
            "link":'/sales_by_date/list',
            "group_roles":["admin","administrator","finance","customercare","management"]
        },{
            "entity":"sales_by_month",
            "title":"Sales By Month",
            "icon":'<span class="fa fa-list fa-fw"></span>',
            "link":'/sales_by_month/list',
            "group_roles":["admin","administrator","finance","customercare","management"]
        },{
            "entity":"sales_monthly_expiration",
            "title":"Account Expiration By Month",
            "icon":'<span class="fa fa-list fa-fw"></span>',
            "link":'/sales_monthly_expiration/list',
            "group_roles":["admin","administrator","finance","customercare","management"]
        },{
            "entity":"sales_by_expiration",
            "title":"Expirations List",
            "icon":'<span class="fa fa-list fa-fw"></span>',
            "link":'/sales_by_expiration/list',
            "group_roles":["admin","administrator","finance","customercare","management"]
        },{
            "entity":"",
            "title":"Expiration Next 30 Days",
            "icon":'<span class="fa fa-list fa-fw"></span>',
            "link":'/sales_by_expiration/list?search=%7B%22next%22:%2230%22%7D',
            "group_roles":["admin","administrator","finance","customercare","management"]
        }]
    },
    {
        "entity":"Combos",
        "title":"Products / Plans",
        "icon":'<span class="fa fa-tags fa-fw"></span>',
        "link":'/Combos/list',
        "group_roles":["admin","administrator","customercare","management"],
        "children": []
    },
    {
        "template":'<div class="menu_space">Settings</div>',
        "group_roles":["admin","administrator","customercare","management"],
        "children": []
    },
    {
        "title":"Company Settings",
        "icon":'<span class="fa fa-cog fa-fw"></span>',
        "link":'/Settings/edit/1',
        "group_roles":["admin","administrator","customercare","management"],
        "children": []
    },
    {
        "entity":"DeviceMenus",
        "title":"Main Menu",
        "icon":'<span class="fa fa-align-justify fa-fw"></span>',
        "link":'/DeviceMenus/list',
        "group_roles":["admin","administrator","customercare","management"],
        "children": []
    },
    {
        "entity":"SystemMenu",
        "title":"System Menu",
        "icon":'<span class="fa fa-align-justify fa-fw"></span>',
        "link":'/SystemMenu/list',
        "group_roles":["admin","administrator","customercare","management"],
        "children": []
    },
    {
        "title":"TV Channels",
        "icon":'<span class="fa fa-television fa-fw"></span>',
        "group_roles":["admin","administrator","customercare","management"],
        "children": [{
            "entity":"Genres",
            "title":"Categories / Genre",
            "icon":'<span class="fa fa-folder-open fa-fw"></span>',
            "link":'/Genres/list',
            "group_roles":["admin","administrator","customercare","management"]
        },{
            "entity":"Channels",
            "title":"Channels / Streams",
            "icon":'<span class="fa fa-television fa-fw"></span>',
            "link":'/Channels/list',
            "group_roles":["admin","administrator","customercare","management"]
        },{
            "entity":"ChannelStreamSources",
            "title":"Live TV Stream Source",
            "icon":'<span class="fa fa-signal fa-fw"></span>',
            "link":'/ChannelStreamSources/list',
            "group_roles":["admin","administrator","customercare","management"]
        },{
            "entity":"livepackages",
            "title":"Channel Packages",
            "icon":'<span class="fa fa-th fa-fw"></span>',
            "link":'/livepackages/list',
            "group_roles":["admin","administrator","customercare","management"]
        }]
    },
    {
        "title":"VOD",
        "icon":'<span class="fa fa-film fa-fw"></span>',
        "group_roles":["admin","administrator","vod","management"],
        "children": [{
            "entity":"VodCategories",
            "title":"VOD Categories",
            "icon":'<span class="fa fa-folder-open fa-fw"></span>',
            "link":'/VodCategories/list',
            "group_roles":["admin","administrator","vod","management"]
        },{
            "entity":"Vods",
            "title":"VOD Movies",
            "icon":'<span class="fa fa-film fa-fw"></span>',
            "link":'/Vods/list',
            "group_roles":["admin","administrator","vod","management"]
        },{
            "entity":"VodStreamSources",
            "title":"VOD Stream Source",
            "icon":'<span class="fa fa-signal fa-fw"></span>',
            "link":'/VodStreamSources/list',
            "group_roles":["admin","administrator","vod","management"]
        },{
            "entity":"vodPackages",
            "title":"VOD Packages",
            "icon":'<span class="fa fa-th fa-fw"></span>',
            "link":'/vodPackages/list',
            "group_roles":["admin","administrator","vod","management"]
        }]
    },
    {
        "title":"EPG",
        "icon":'<span class="fa fa-map-o fa-fw"></span>',
        "group_roles":["admin","administrator","epg","management"],
        "children": [{
            "entity":"epgimport",
            "title":"EPG Import",
            "icon":'<span class="fa fa-map-o fa-fw"></span>',
            "link":'/epgimport/create',
            "group_roles":["admin","administrator","epg","management"]
        },{
            "entity":"EpgData",
            "title":"EPG Data",
            "icon":'<span class="fa fa-list fa-fw"></span>',
            "link":'/EpgData/list',
            "group_roles":["admin","administrator","epg","management"]
        },{
            "entity":"",
            "title":"EPG Graph",
            "icon":'<span class="fa fa-bar-chart fa-fw"></span>',
            "link":'/epggraph',
            "group_roles":["admin","administrator","epg","management"]
        }]
    },
    {
        "entity":"appgroup",
        "title":"APP Group",
        "icon":'<span class="fa fa-file fa-fw"></span>',
        "link":'/appgroup/list',
        "group_roles":["admin","administrator","customercare","management"],
        "children": []
    },
    {
        "title":"System Users",
        "icon":'<span class="fa fa-users fa-fw"></span>',
        "group_roles":["admin","administrator","customercare","management"],
        "children": [{
            "entity":"Groups",
            "title":"User Groups",
            "icon":'<span class="fa fa-users fa-fw"></span>',
            "link":'/Groups/list',
            "group_roles":["admin","administrator","customercare","management"]
        },{
            "entity":"Users",
            "title":"Users",
            "icon":'<span class="fa fa-user fa-fw"></span>',
            "link":'/Users/list',
            "group_roles":["admin","administrator","management"]
        }]
    },
    {
        "template":'<div class="menu_space">Other</div>',
        "group_roles":["admin","administrator","customercare","management"],
        "children": []
    },
    {
        "entity":"appmanagement",
        "title":"APP Management",
        "icon":'<span class="fa fa-upload fa-fw"></span>',
        "link":'/appmanagement/list',
        "group_roles":["admin","administrator","customercare","management"],
        "children": []
    },
    {
        "entity":"mychannels",
        "title":"My Channels",
        "icon":'<span class="fa fa-tv fa-fw"></span>',
        "link":'/mychannels/list',
        "group_roles":["admin","administrator","customercare","management"],
        "children": []
    },
    {
        "entity":"logs",
        "title":"Logs",
        "icon":'<span class="fa fa-book fa-fw"></span>',
        "link":'/logs/list',
        "group_roles":["admin","administrator","customercare","management"],
        "children": []
    },
    {
        "entity":"PaymentTransactions",
        "title":"Payment Transaction",
        "icon":'<span class="fa fa-book fa-fw"></span>',
        "link":'/PaymentTransactions/list',
        "group_roles":["admin","administrator","customercare","management"],
        "children": []
    },
    {
        "title":"Push messages",
        "icon":'<span class="fa fa-envelope fa-fw"></span>',
        "group_roles":["admin","administrator","customercare","management"],
        "children": [{
            "entity":"messages",
            "title":"Push notifications",
            "icon":'<span class="fa fa-bell fa-fw"></span>',
            "link":'/messages/list',
            "group_roles":["admin","administrator","customercare","management"]
        },{
            "entity":"commands",
            "title":"Commands",
            "icon":'<span class="fa fa-terminal fa-fw"></span>',
            "link":'/commands/list',
            "group_roles":["admin","administrator","customercare"]
        },{
            "entity":"ads",
            "title":"Ads",
            "icon":'<span class="fa fa-buysellads fa-fw"></span>',
            "link":'/ads/list',
            "group_roles":["admin","administrator","customercare","management"]
        }]
    },
    {
        "entity":"",
        "title":"HELP",
        "icon":'<span class="fa fa-question-circle fa-fw"></span>',
        "link":'/dashboard',
        "group_roles":["admin","administrator","customercare","management"],
        "children": []
    }
];