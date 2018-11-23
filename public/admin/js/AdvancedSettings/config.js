import edit_button from '../edit_button.html';

export default function (nga, admin) {
    var AdvancedSettings = admin.getEntity('AdvancedSettings');

    AdvancedSettings.listView()
        .title('<h4>Advanced Settings <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
        .actions([])
        .batchActions([])
        .fields([
            nga.field('id')
                .label('ID'),
            nga.field('parameter_id')
                .label('Parameter ID'),
            nga.field('parameter_value')
                .label('Parameter'),
            nga.field('parameter1_value')
                .label('Parameter 1'),
            nga.field('parameter2_value')
                .label('Parameter 2'),
            nga.field('duration')
                .label('Duration'),
            nga.field('description','text')
                .label('Description'),
        ])
        .listActions(['edit']);

    AdvancedSettings.editionView()
        .title('<h4>Advanced Settings <i class="fa fa-angle-right" aria-hidden="true"></i> Edit: {{ entry.values.id }}</h4>')
        .fields([
            nga.field('parameter_id')
                .attributes({ readOnly: true })
                .validation({ required: true })
                .label('Parameter ID'),
            nga.field('parameter_value')
                .validation({ required: true })
                .label('Parameter'),
            nga.field('parameter1_value')
                .label('Parameter 1'),
            nga.field('parameter2_value')
                .label('Parameter 2'),
            nga.field('duration','number')
                .label('Duration'),

            nga.field('description','text')
                .attributes({ placeholder: 'Usage Description' })
                .validation({ maxlength: 1000})
                .label('Description'),


            nga.field('template')
                .label('')
                .template(edit_button)
        ]);


    AdvancedSettings.editionView()
        .actions(['list'])
        .title('<h4>Advanced Settings <i class="fa fa-angle-right" aria-hidden="true"></i> Edit: {{ entry.values.id }}</h4>')
        .fields([
            AdvancedSettings.creationView().fields()
        ]);

    AdvancedSettings.deletionView()
        .title('<h4>Advanced Settings <i class="fa fa-angle-right" aria-hidden="true"></i> Remove <span style ="color:red;"> {{ entry.values.id }}')
        .actions(['<ma-back-button entry="entry" entity="entity"></ma-back-button>'])

    return AdvancedSettings;

}