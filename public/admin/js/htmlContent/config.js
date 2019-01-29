import edit_button from '../edit_button.html';

export default function (nga, admin) {
    var htmlContent = admin.getEntity('htmlContent');

    htmlContent.listView()
        .title('<h4>HTML Content <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
        .listActions(['edit','delete'])
        .batchActions([])
        .fields([
            nga.field('id')
                .label('ID'),
            nga.field('name')
                .label('Name'),
            nga.field('description')
                .label('Description'),
            nga.field('content')
                .map(function truncate(value) {
                    if (!value) return '';
                    return value.length > 80 ? value.substr(0, 80) + '...' : value;
                })
                .label('Content'),
            nga.field('url')
                .label('Url')
        ]);

    htmlContent.creationView()
        .title('<h4>HTML Content <i class="fa fa-angle-right" aria-hidden="true"></i> Create: Template</h4>')
        .fields([
            nga.field('id','number')
                .attributes({ placeholder: 'ID' })
                .validation({required: true})
                .label('ID'),
            nga.field('name','string')
                .attributes({ placeholder: 'Name' })
                .validation({required: true})
                .label('Name'),
            nga.field('description','string')
                .attributes({ placeholder: 'Description' })
                .validation({required: true})
                .label('Description'),
            nga.field('content','wysiwyg')
                .attributes({ placeholder: 'HTML Content' })
                .validation({validator: function(value) {
                        if(value === null || value === ''){
                            throw new Error('Content Cannot Be Empty');
                        }
                    }
                })
                .label('Content *'),
            nga.field('url')
            .transform(function (value,entry) {
                var url = window.location.origin + '/api/htmlContentApp/' + entry.id;
                return url;
            })
                .cssClasses('hidden')
                .label(''),
            nga.field('template')
                .label('')
                .template(edit_button)
        ]);


    htmlContent.editionView()
        .actions(['list'])
        .title('<h4>HTML Content <i class="fa fa-angle-right" aria-hidden="true"></i> Edit: {{ entry.values.id }}</h4>')
        .fields([
            nga.field('name','string')
                .attributes({ placeholder: 'Name', readOnly: true })
                .validation({required: true})
                .label('Name'),
            nga.field('description','string')
                .attributes({ placeholder: 'Description' })
                .validation({required: true})
                .label('Description'),
            nga.field('content','wysiwyg')
                .attributes({ placeholder: 'HTML Content' })
                .validation({validator: function(value) {
                        if(value === null || value === ''){
                            throw new Error('Content Cannot Be Empty');
                        }
                    }
                })
                .label('Content *'),

            nga.field('template')
                .label('')
                .template(edit_button)
        ]);

    htmlContent.deletionView()
        .title('<h4>HTML Content <i class="fa fa-angle-right" aria-hidden="true"></i> Remove <span style ="color:red;"> {{ entry.values.id }}')
        .actions(['<ma-back-button entry="entry" entity="entity"></ma-back-button>'])

    return htmlContent;

}