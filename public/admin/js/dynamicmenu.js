export default function (nga, admin, menujson) {

    var returnmenu = nga.menu();
    var menuidx = 0;


    for(var i=0;i<menujson.length;i++) {


        if((menujson[i].group_roles.indexOf(localStorage.userRole)) > -1) {
            //add parent menu item
            returnmenu.addChild(nga.menu()
                .title(menujson[i].title)
                .icon(menujson[i].icon)
                .link(menujson[i].link))

            if (menujson[i].template) {
                returnmenu._children[menuidx]._template = menujson[i].template;
            }

            //if menu has sub menus
            if (menujson[i].children.length > 0) {
                //start adding children menu items
                for (var j = 0; j < menujson[i].children.length; j++) {

                    if((menujson[i].children[j].group_roles.indexOf(localStorage.userRole)) > -1){
                        //add child menu item
                        returnmenu._children[menuidx].addChild(nga.menu()
                            .title(menujson[i].children[j].title)
                            .icon(menujson[i].children[j].icon)
                            .link(menujson[i].children[j].link)
                        )
                    }
                }
            }


            menuidx++;
        }
    }

    return returnmenu;
}