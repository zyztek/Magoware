import edit_button from '../edit_button.html';

export default function (nga, admin) {
    var VodMenu = admin.getEntity('vodMenu');

    VodMenu.listView()
        .title('<h4>Vod Menu <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
        .batchActions([])
        .actions(['create'])
        .fields([
            nga.field('id')
                .label('ID'),
            nga.field('name','string')
                .label('Vod Menu Name'),
            nga.field('order','number')
                .label('Order'),
            nga.field('pin_protected','boolean')
                .label('Pin Protected'),
            nga.field('isavailable','boolean')
                .label('Available')
        ])
        .listActions(['edit','delete']);

    VodMenu.creationView()
        .title('<h4>Vod Menu <i class="fa fa-angle-right" aria-hidden="true"></i> Create: {{ entry.values.id }}</h4>')
        .fields([
            nga.field('name','string')
                .attributes({ placeholder: 'Vod Menu Name' })
                .validation({ required: true })
                .label('Vod Menu Name'),
            nga.field('description','text')
                .transform(function lineBreaks(value, entry) {
                    return value.split("\n").join("<br/>");
                })
                .attributes({ placeholder: 'Description' })
                .validation({ required: true })
                .label('Description'),
            nga.field('order','number')
                .attributes({ placeholder: 'Order' })
                .validation({ required: true })
                .label('Order'),
            nga.field('pin_protected','boolean')
                .attributes({ placeholder: 'Pin Protected' })
                .validation({ required: true })
                .label('Pin Protected'),
            nga.field('isavailable','boolean')
                .attributes({ placeholder: 'Is Available' })
                .validation({ required: true })
                .label('Is Available'),


            nga.field('template')
                .label('')
                .template(edit_button)
        ]);


    VodMenu.editionView()
        .actions(['list'])
        .title('<h4>Vod Menu <i class="fa fa-angle-right" aria-hidden="true"></i> Edit: {{ entry.values.id }}</h4>')
        .fields([
            VodMenu.creationView().fields()
        ]);

    VodMenu.deletionView()
        .title('<h4>Vod Menu <i class="fa fa-angle-right" aria-hidden="true"></i> Remove <span style ="color:red;"> {{ entry.values.id }}')
        .actions(['<ma-back-button entry="entry" entity="entity"></ma-back-button>'])

    return VodMenu;

}