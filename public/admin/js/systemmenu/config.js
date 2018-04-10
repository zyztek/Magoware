import edit_button from '../edit_button.html';

export default function (nga, admin) {
    var systemmenu = admin.getEntity('SystemMenu');


    systemmenu.listView()
        .title('<h4>System Menu <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
        .batchActions([])

        .fields([

            nga.field('id', 'string')
                .label('Menu Code'),
            nga.field('title', 'string')
                .label('Menu Title')
                .map(function deepth(value, entry) {
                    if(entry.parent_menu_code !== 'root') value = "--" + value;
                    return value;
                }),
            nga.field('menu_order', 'number')
                .label('Menu Order'),
            nga.field('link', 'string')
                .label('Link'),
            nga.field('isavailable', 'boolean')
                .label('Available')
        ])
        .listActions(['edit'])
        .exportFields([
            systemmenu.listView().fields(),
        ]);


    systemmenu.creationView()
        .title('<h4>system Menu <i class="fa fa-angle-right" aria-hidden="true"></i> Create: Sytem Menu</h4>')
        .fields([

            nga.field('parent_menu_code', 'reference')
                .targetEntity(admin.getEntity('SystemMenu'))
                .targetField(nga.field('menu_name'))
                .attributes({ placeholder: 'Leave empty for root menu' })
                .permanentFilters({
                    root: true // display only the published posts
                })
                .label('Parent Menu Code'),
            nga.field('id', 'string')
                .label('Menu Code'),
            nga.field('title', 'string')
                .label('Menu Title'),
            nga.field('menu_order', 'number')
                .label('Menu Order'),
            nga.field('entity_name', 'string')
                .label('System Entity Name'),

            nga.field('icon', 'string')
                .label('Icon'),

            nga.field('link', 'string')
                .label('Link'),
            nga.field('template', 'string')
                .label('Template'),

            nga.field('isavailable', 'boolean')
                .label('Available')
                .defaultValue(true)
                .validation({ required: true }),
            nga.field('template')
                .label('')
                .template(edit_button)
        ])


    systemmenu.editionView()
        .title('<h4>Users <i class="fa fa-angle-right" aria-hidden="true"></i> Edit: {{ entry.values.username }}</h4>')
        .actions(['list'])
        .fields([
            systemmenu.creationView().fields(),
        ]);


    return systemmenu;

}