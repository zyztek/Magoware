export default function (nga, admin, menujson) {

    var returnmenu = nga.menu();
    var tmpmenu = nga.menu();

    for(var i=0;i<menujson.length;i++) {

        //add parent menu item
        returnmenu.addChild(nga.menu()
                    .title(menujson[i].title)
                    .icon(menujson[i].icon)
                    .link(menujson[i].link))

                    if(menujson[i].template) {
                        returnmenu._children[i]._template = menujson[i].template;
                    }

        //if menu has sub menus
        if(menujson[i].children.length > 0) {
            //start adding children menu items
            for(var j=0;j<menujson[i].children.length;j++){
                //add child menu item
                returnmenu._children[i].addChild(nga.menu()
                                                .title(menujson[i].children[j].title)
                                                .icon(menujson[i].children[j].icon)
                                                 )
            }
        }

    }

    return returnmenu;
}
