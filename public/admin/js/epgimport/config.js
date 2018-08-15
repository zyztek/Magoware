import epg_logs from '../epg_logs.html';

export default function (nga, admin) {
    var epgImport = admin.getEntity('epgimport');
    epgImport.listView()
        .title('<h4>Epg Data <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
        .actions(['create'])
        .fields([
            nga.field('channel_number')
                .cssClasses('hidden-xs')
                .label('Nr'),
            nga.field('title', 'string')
                .label('Title'),
            nga.field('short_name', 'string')
                .cssClasses('hidden-xs')
                .label('Short Name'),
            nga.field('short_description')
                .label('Short Description'),
            nga.field('program_start', 'datetime')
                .cssClasses('hidden-xs')
                .label('Program Start'),
            nga.field('program_end', 'datetime')
                .cssClasses('hidden-xs')
                .label('Program End'),
            nga.field('duration_seconds', 'number')
                .cssClasses('hidden-xs')
                .label('Duration'),
            nga.field('timezone', 'number')
                .map(function truncate(value) {
                    if (!value) {
                        return "No Timezone";
                    }
                })
                .cssClasses('hidden-xs')
                .label('Timezone'),
        ])
        .batchActions([])
        .filters([
            nga.field('q')
                .label('')
                .template('<div class="input-group"><input type="text" ng-model="value" placeholder="Search" class="form-control"></input><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span></div>')
                .pinned(true)])
    ;


    epgImport.creationView()
        .onSubmitSuccess(['progression', 'notification', '$state', 'entry', 'entity', function(progression, notification, $state, entry, entity) {
            return false;
        }])
        .title('<h4>Epg Data <i class="fa fa-angle-right" aria-hidden="true"></i> Import EPG</h4>')
        .fields([
            nga.field('channel_number', 'string')
                .attributes({ placeholder: 'Channel number' })
                .validation({ required: false })
                .label('Enter channel number'),
            nga.field('delete_existing', 'boolean')
                .attributes({ placeholder: 'deleteorappend' })
                .validation({ required: true })
                .label('Delete existing data'),
            nga.field('timezone', 'number')
                .attributes({ placeholder: 0 })
                .validation({
                    validator: function(value) {
                        if (value == null) value = 0;
                        if(value<-12 || value>12) throw new Error('Timezone should be in the range of [-12:12]');
                    }
                })
                .label('Generated with timezone:'),
            nga.field('encoding', 'choice')
                .attributes({ placeholder: 'utf-8' })
                .choices([
                    { value: 'ascii', label: 'ascii' },
                    { value: 'utf-8', label: 'utf-8' },
                    { value: 'ISO-8859-1', label: 'latin1 ' }
                ])
                .label('Epg file encoding'),
            nga.field('epg_file','file')
                .uploadInformation({ 'url': '/file-upload/single-file/epg/epg_file', 'accept': 'image/*, .csv, text/xml, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'apifilename': 'result', multiple: true})
                .template('<div class="row">'+
                    '<div class="col-xs-12 col-sm-8"><ma-file-field field="field" value="entry.values.epg_file"></ma-file-field></div>'+
                    '<div class="col-xs-12 col-sm-1" style="display: none;"><img src="{{ entry.values.epg_file }}"/></div>'+
                    '</div>'+
                    '<div class="row"><small id="emailHelp" class="form-text text-muted">Expected file types: csv and xml</small></div>')
                .label('File input *'),
            nga.field('epg_url', 'string')
                .attributes({ placeholder: 'Url of the epg file' })
                .validation({ required: false })
                .label('Enter the url for the epg file'),
            nga.field('template')
                .label('')
                .template(epg_logs),
        ]);

    return epgImport;

}