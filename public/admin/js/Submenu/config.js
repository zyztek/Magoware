
import edit_button from '../edit_button.html';

export default function (nga, admin) {
    var Submenu = admin.getEntity('Submenu');
    var appids = {1: 'Android Set Top Box', 2: 'Android Smart Phone',3: 'IOS', 4: 'Android Smart TV', 5: 'Samsung Smart TV', 6: 'Apple TV'};

    Submenu.listView()

        .title('<h4>Submenu <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
        .batchActions([])
        .fields([
            nga.field('icon_url', 'file')
                .template('<img src="{{ entry.values.icon_url }}" height="42" width="45" />')
                .cssClasses('hidden-xs')
                .label('Icon'),
            nga.field('title', 'string')
                .isDetailLink(true)
                .label('Title'),
            nga.field('url')
                .map(function truncate(value) {
                    if (!value) {
                        return '';
                    }
                    return value.length > 25 ? value.substr(0, 25) + '...' : value;
                })
                .cssClasses('hidden-xs')
                .label('Url'),
            nga.field('menu_code', 'choice')
                .attributes({ placeholder: 'Menu Code' })
                .choices([
                    { value: 0, label: 'Url' },
                    { value: 1, label: 'Live TV' },
                    { value: 2, label: 'EPG' },
                    { value: 3, label: 'Logout' },
                    { value: 4, label: 'Apps' },
                    { value: 10, label: 'Network Test' },
                    { value: 11, label: 'Vod' },
                    { value: 12, label: 'Application menu' },
                    { value: 20, label: 'Personal' },
                    { value: 21, label: 'Catchup' }
                ])
                .validation({ required: true })
                .label('Menu Code'),
            nga.field('position', 'string')
                .label('Position'),

            nga.field('appid','template')
                .map(function toarray(value) {
                    var thearray = JSON.parse("["+value+"]");
                    var returnobj = {};
                    thearray.forEach(function(element) {
                        returnobj[element] = appids[element];
                    });
                    return returnobj;
                })
                .template('<span ng-repeat="theappid in entry.values.appid track by $index" class="label label-default">{{theappid}}</span>')
                .label('Applications IDs'),

            nga.field('isavailable', 'boolean')
                .label('Available'),
        ])
        .filters([
            nga.field('q')
                .label('')
                .template('<div class="input-group"><input type="text" ng-model="value" placeholder="Search" class="form-control"></input><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span></div>')
                .pinned(true),
        ])
        .listActions(['edit','delete'])


        .exportFields([
            Submenu.listView().fields(),
        ]);


    Submenu.creationView()
        .onSubmitSuccess(['progression', 'notification', '$state', 'entry', 'entity', function(progression, notification, $state, entry, entity) {
            progression.done();
            $state.go($state.get('list'), { entity: entity.name() });
            return false;
        }])
        .title('<h4>Submenu <i class="fa fa-angle-right" aria-hidden="true"></i> Create: Menu</h4>')
        .fields([
            nga.field('title', 'string')
                .attributes({ placeholder: 'Name menu item' })
                .validation({ required: true })
                .label('Title'),
            nga.field('url', 'string')
                .attributes({ placeholder: 'In case you are adding an external application (for example youtube) fill the application url.' })
                .label('Url'),
            nga.field('icon_url', 'file')
                .uploadInformation({ 'url': '/file-upload/single-file/device_menu/icon_url','apifilename': 'result'})
                .template('<div class="row">'+
                    '<div class="col-xs-12 col-sm-1"><img src="{{ entry.values.icon_url }}" height="40" width="40" /></div>'+
                    '<div class="col-xs-12 col-sm-8"><ma-file-field field="field" value="entry.values.icon_url"></ma-file-field></div>'+
                    '</div>'+
                    '<div class="row"><small id="emailHelp" class="form-text text-muted">240x240 px, not larger than 600 KB</small></div>')
                .validation({
                    validator: function(value) {
                        if (value == null) {
                            throw new Error('Please, choose icon');
                        }else {
                            var icon_url = document.getElementById('icon_url');
                            if (icon_url.value.length > 0) {
                                if(icon_url.files[0].size > 614400 ){
                                    throw new Error('Your Icon is too Big, not larger than 600 KB');
                                }
                            }
                        }
                    }
                })
                .label('Icon *'),
            nga.field('menu_code', 'choice')
                .attributes({ placeholder: 'Choose from dropdown list the type of menu item you are creating' })
                .choices([
                    { value: 0, label: 'Url' },
                    { value: 1, label: 'Live TV' },
                    { value: 2, label: 'EPG' },
                    { value: 3, label: 'Logout' },
                    { value: 4, label: 'Apps' },
                    { value: 10, label: 'Network Test' },
                    { value: 11, label: 'Vod' },
                    { value: 12, label: 'Application menu' },
                    { value: 20, label: 'Personal' },
                    { value: 21, label: 'Catchup' }
                ])
                .validation({validator: function(value) {
                        if(value === null || value === ''){
                            throw new Error('Please Select Menu Code');
                        }
                    }
                })
                .label('Menu Code *'),

            nga.field('appid', 'choices')
                .attributes({ placeholder: 'Choose from dropdown list the device application this menu will belong to' })
                .choices([
                    { value: 1, label: 'Android Set Top Box' },
                    { value: 2, label: 'Android Smart Phone' },
                    { value: 3, label: 'IOS' },
                    { value: 4, label: 'Android Smart TV' },
                    { value: 5, label: 'Samsung Smart TV' },
                    { value: 6, label: 'Apple TV' }
                ])
                .validation({validator: function(value) {
                        if(value === null || value === ''){
                            throw new Error('Please Select Applications IDs');
                        }
                    }
                })
                .label('Applications IDs *'),
            nga.field('position', 'string')
                .attributes({ placeholder: 'Position of this menu item in main menu ex:if you place number 1 this menu item will be the first one in main menu' })
                .validation({ required: true })
                .label('Position'),
            nga.field('isavailable', 'boolean')
                .attributes({ placeholder: 'Is Available' })
                .validation({ required: true })
                .label('Is Available'),
            nga.field('parent_id','reference')
                .targetEntity(admin.getEntity('DeviceMenus'))
                .targetField(nga.field('title'))
                .attributes({ placeholder: 'Choose from dropdown list the parent that this menu will belong to' })
                .validation({validator: function(value) {
                        if(value === null || value === ''){
                            throw new Error('Please Select Parent ID');
                        }
                    }
                })
                .label('Parent ID *'),
            nga.field('menu_description')
                .attributes({ placeholder: 'Menu Description' })
                .validation({ required: true })
                .label('Menu Description'),
            nga.field('menu_level')
                .defaultValue(2)
                .cssClasses('hidden')
                .label(''),


            nga.field('template')
                .label('')
                .template(edit_button),

        ]);

    Submenu.editionView()
        .title('<h4>Submenu <i class="fa fa-angle-right" aria-hidden="true"></i> Edit: {{ entry.values.title }}</h4>')
        .actions(['list'])
        .fields([
            Submenu.creationView().fields(),
        ]);


    return Submenu;

}

