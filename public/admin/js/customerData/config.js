import edit_button from '../edit_button.html';

export default function (nga, admin) {
	var customerdata = admin.getEntity('CustomerData');
	customerdata.listView()
		.title('<h4>Customer Data <i class="fa fa-angle-right" aria-hidden="true"></i> List</h4>')
        .batchActions([])
		.fields([
            nga.field('group_id', 'reference')                    
            	.targetEntity(admin.getEntity('CustomerGroups'))
                .targetField(nga.field('description'))
                .cssClasses('hidden-xs')
                .label('Group'),
			nga.field('firstname', 'string')
				.label('Firstname'),
			nga.field('lastname', 'string')
				.label('Lastname'),
			nga.field('email', 'email')
				.cssClasses('hidden-xs')
				.label('Email'),
			nga.field('address', 'string')
                .map(function truncate(value) {
                    if (!value) {
                            return '';
                        }
                            return value.length > 15 ? value.substr(0, 15) + '...' : value;
                        })
                .cssClasses('hidden-xs')
				.label('Address'),
			nga.field('city', 'string')
				.cssClasses('hidden-xs')
				.label('City'),
			nga.field('country')
				.cssClasses('hidden-xs')
				.label('Country'),
			nga.field('telephone', 'string')
				.cssClasses('hidden-xs')
				.label('Telephone'),
		])
        .filters([
          nga.field('q')
              .label('')
              .template('<div class="input-group"><input type="text" ng-model="value" placeholder="Search" class="form-control"></input><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span></div>')
              .pinned(true)])
		.listActions(['edit'])
        .exportFields([
                customerdata.listView().fields(),
        ]);

    customerdata.creationView()
        .title('<h4>Customer Data <i class="fa fa-angle-right" aria-hidden="true"></i> Create Customer</h4>')
        .onSubmitSuccess(['progression', 'notification', '$state', 'entry', 'entity', function(progression, notification, $state, entry, entity) {
            progression.done();
            $state.go($state.get('edit'), { entity: entity.name(), id: entry._identifierValue });
            return false;
        }])
        .fields([
            nga.field('group_id', 'reference')
                .targetEntity(admin.getEntity('CustomerGroups'))
                .targetField(nga.field('description'))
                .attributes({ placeholder: 'Select from the dropdown list one of the groups you created' })
                .label('Group *')
                .perPage(-1)
                .validation({validator: function(value) {
                        if(value === null || value === ''){
                            throw new Error('Please Select Group');
                        }
                    }
                }),
            nga.field('firstname', 'string')
                .attributes({ placeholder: 'Customer Firstname' })
                .validation({ required: true })
                .label('Firstname'),
            nga.field('lastname', 'string')
                .attributes({ placeholder: 'Customer Lastname' })
                .validation({ required: true })
                .label('Lastname'),
            nga.field('email', 'email')
                .attributes({ placeholder: 'Customer email' })
                .validation({ required: true })
                .label('Email'),
            nga.field('address', 'string')
                .attributes({ placeholder: 'Customer address (for example house number, street or other information)' })
                .validation({ required: true })
                .label('Address'),
            nga.field('city', 'string')
                .attributes({ placeholder: 'Part of customer address'})
                .validation({ required: true })
                .label('City'),
            nga.field('country', 'choice')
                .choices([
                    {   value:' Afghanistan' ,   label:' Afghanistan' }   ,
                    {   value:' Albania' ,   label:' Albania' }   ,
                    {   value:' Algeria' ,   label:' Algeria' }   ,
                    {   value:' Andorra' ,   label:' Andorra' }   ,
                    {   value:' Angola'  ,   label:' Angola'  }   ,
                    {   value:' Antigua and Barbuda' ,   label:' Antigua and Barbuda' }   ,
                    {   value:' Argentina'   ,   label:' Argentina'   }   ,
                    {   value:' Armenia' ,   label:' Armenia' }   ,
                    {   value:' Australia'   ,   label:' Australia'   }   ,
                    {   value:' Austria' ,   label:' Austria' }   ,
                    {   value:' Azerbaijan'  ,   label:' Azerbaijan'  }   ,
                    {   value:' Bahamas' ,   label:' Bahamas' }   ,
                    {   value:' Bahrain' ,   label:' Bahrain' }   ,
                    {   value:' Bangladesh'  ,   label:' Bangladesh'  }   ,
                    {   value:' Barbados'    ,   label:' Barbados'    }   ,
                    {   value:' Belarus' ,   label:' Belarus' }   ,
                    {   value:' Belgium' ,   label:' Belgium' }   ,
                    {   value:' Belize'  ,   label:' Belize'  }   ,
                    {   value:' Benin'   ,   label:' Benin'   }   ,
                    {   value:' Bhutan'  ,   label:' Bhutan'  }   ,
                    {   value:' Bolivia' ,   label:' Bolivia' }   ,
                    {   value:' Bosnia and Herzegovina'  ,   label:' Bosnia and Herzegovina'  }   ,
                    {   value:' Botswana'    ,   label:' Botswana'    }   ,
                    {   value:' Brazil'  ,   label:' Brazil'  }   ,
                    {   value:' Brunei Darussalam'   ,   label:' Brunei Darussalam'   }   ,
                    {   value:' Bulgaria'    ,   label:' Bulgaria'    }   ,
                    {   value:' Burkina Faso'    ,   label:' Burkina Faso'    }   ,
                    {   value:' Burundi' ,   label:' Burundi' }   ,
                    {   value:' Cabo Verde'  ,   label:' Cabo Verde'  }   ,
                    {   value:' Cambodia'    ,   label:' Cambodia'    }   ,
                    {   value:' Cameroon'    ,   label:' Cameroon'    }   ,
                    {   value:' Canada'  ,   label:' Canada'  }   ,
                    {   value:' Central African Republic'    ,   label:' Central African Republic'    }   ,
                    {   value:' Chad'    ,   label:' Chad'    }   ,
                    {   value:' Chile'   ,   label:' Chile'   }   ,
                    {   value:' China'   ,   label:' China'   }   ,
                    {   value:' Colombia'    ,   label:' Colombia'    }   ,
                    {   value:' Comoros' ,   label:' Comoros' }   ,
                    {   value:' Congo'   ,   label:' Congo '  }   ,
                    {   value:' Costa Rica'  ,   label:' Costa Rica'  }   ,
                    {   value:' Côte D Ivoire'   ,   label:' Côte D Ivoire'   }   ,
                    {   value:' Croatia' ,   label:' Croatia' }   ,
                    {   value:' Cuba'    ,   label:' Cuba'    }   ,
                    {   value:' Cyprus'  ,   label:' Cyprus'  }   ,
                    {   value:' Czech Republic'  ,   label:' Czech Republic'  }   ,
                    {   value:' (North Korea)' ,   label:'(North Korea)' }   ,
                    {   value:' Congo' ,   label:' Congo' }   ,
                    {   value:' Denmark' ,   label:' Denmark' }   ,
                    {   value:' Djibouti'    ,   label:' Djibouti'    }   ,
                    {   value:' Dominica'    ,   label:' Dominica'    }   ,
                    {   value:' Dominican Republic'  ,   label:' Dominican Republic'  }   ,
                    {   value:' Ecuador' ,   label:' Ecuador' }   ,
                    {   value:' Egypt'   ,   label:' Egypt'   }   ,
                    {   value:' El Salvador' ,   label:' El Salvador' }   ,
                    {   value:' Equatorial Guinea'   ,   label:' Equatorial Guinea'   }   ,
                    {   value:' Eritrea' ,   label:' Eritrea' }   ,
                    {   value: 'Estonia' ,   label:' Estonia' }   ,
                    {   value:' Ethiopia'    ,   label:' Ethiopia'    }   ,
                    {   value:' Fiji'    ,   label:' Fiji'    }   ,
                    {   value:' Finland' ,   label:' Finland' }   ,
                    {   value:' France'  ,   label:' France'  }   ,
                    {   value:' Gabon'   ,   label:' Gabon '  }   ,
                    {   value:' Gambia'  ,   label:' Gambia ' }   ,
                    {   value:' Georgia' ,   label:' Georgia' }   ,
                    {   value:' Germany' ,   label:' Germany '}   ,
                    {   value:' Ghana'   ,   label:' Ghana '  }   ,
                    {   value:' Greece'  ,   label:' Greece ' }   ,
                    {   value:' Grenada' ,   label:' Grenada' }   ,
                    {   value:' Guatemala'   ,   label:' Guatemala'   }   ,
                    {   value:' Guinea'  ,   label:' Guinea'  }   ,
                    {   value:' Guinea-Bissau'   ,   label:' Guinea-Bissau'   }   ,
                    {   value:' Guyana'  ,   label:' Guyana'  }   ,
                    {   value:' Haiti'   ,   label:' Haiti '  }   ,
                    {   value:' Honduras'    ,   label:' Honduras'    }   ,
                    {   value:' Hungary' ,   label:' Hungary' }   ,
                    {   value:' Iceland' ,   label:' Iceland '}   ,
                    {   value:' India'   ,   label:' India '  }   ,
                    {   value:' Indonesia'   ,   label:' Indonesia'   }   ,
                    {   value:' Iran'    ,   label:' Iran '   }   ,
                    {   value:' Iraq'    ,   label:' Iraq'    }   ,
                    {   value:' Ireland' ,   label:' Ireland '}   ,
                    {   value:' Israel'  ,   label:' Israel'  }   ,
                    {   value:' Italy'   ,   label:' Italy' }   ,
                    {   value:' Jamaica' ,   label:' Jamaica' }   ,
                    {   value:' Japan'   ,   label:' Japan '  }   ,
                    {   value:' Jordan'  ,   label:' Jordan'  }   ,
                    {   value:' Kazakhstan'  ,   label:' Kazakhstan ' }   ,
                    {   value:' Kenya'   ,   label:' Kenya '  }   ,
                    {   value:' Kiribati'    ,   label:' Kiribati'    }   ,
                    {   value:' Kuwait'  ,   label:' Kuwait'  }   ,
                    {   value:' Kyrgyzstan'  ,   label:' Kyrgyzstan'  }   ,
                    {   value:' Lao' ,   label:' Lao' }  ,
                    {   value:' Latvia'  ,   label:' Latvia'  }   ,
                    {   value:' Lebanon' ,   label:' Lebanon' }   ,
                    {   value:' Lesotho' ,   label:' Lesotho' }   ,
                    {   value:' Liberia' ,   label:' Liberia' }   ,
                    {   value:' Libya'   ,   label:' Libya '  }   ,
                    {   value:' Liechtenstein'   ,   label:' Liechtenstein'   }   ,
                    {   value:' Lithuania'   ,   label:' Lithuania '  }   ,
                    {   value:' Luxembourg'  ,   label:' Luxembourg'  }   ,
                    {   value:' Macedonia'   ,   label:' Macedonia '  }   ,
                    {   value:' Madagascar'  ,   label:' Madagascar'  }   ,
                    {   value:' Malawi'  ,   label:' Malawi ' }   ,
                    {   value:' Malaysia'    ,   label:' Malaysia'    }   ,
                    {   value:' Maldives'    ,   label:' Maldives '   }   ,
                    {   value:' Mali'   ,   label:' Mali'    }   ,
                    {   value:' Malta'   ,   label:' Malta'   }   ,
                    {   value:' Marshall Islands'    ,   label:' Marshall Islands '   }   ,
                    {   value:' Mauritania'  ,   label:' Mauritania'  }   ,
                    {   value:' Mauritius'   ,   label:' Mauritius'   }   ,
                    {   value:' Mexico'  ,   label:' Mexico'  }   ,
                    {   value:' Micronesia'    ,   label:' Micronesia'   }   ,
                    {   value:' Monaco'  ,   label:' Monaco'  }   ,
                    {   value:' Mongolia'    ,   label:' Mongolia'    }   ,
                    {   value:' Montenegro'  ,   label:' Montenegro'  }   ,
                    {   value:' Morocco' ,   label:' Morocco' }   ,
                    {   value:' Mozambique'  ,   label:' Mozambique'  }   ,
                    {   value:' Myanmar' ,   label:' Myanmar' }   ,
                    {   value:' Namibia' ,   label:' Namibia '}   ,
                    {   value:' Nauru'   ,   label:' Nauru '  }   ,
                    {   value:' Nepal'   ,   label:' Nepal '  }   ,
                    {   value:' Netherlands' ,   label:' Netherlands' }   ,
                    {   value:' New Zealand' ,   label:' New Zealand' }   ,
                    {   value:' Nicaragua'   ,   label:' Nicaragua '  }   ,
                    {   value:' Niger'   ,   label:' Niger  ' }   ,
                    {   value:' Nigeria' ,   label:' Nigeria '}   ,
                    {   value:' Norway'  ,   label:' Norway ' }   ,
                    {   value:' Oman'    ,   label:' Oman '   }   ,
                    {   value:' Pakistan'    ,   label:' Pakistan '   }   ,
                    {   value:' Palau'   ,   label:' Palau '  }   ,
                    {   value:' Panama'  ,   label:' Panama ' }   ,
                    {   value:' Papua New Guinea'    ,   label:' Papua New Guinea '   }   ,
                    {   value:' Paraguay'    ,   label:' Paraguay '   }   ,
                    {   value:' Peru'    ,   label:' Peru'    }   ,
                    {   value:' Philippines' ,   label:' Philippines '}   ,
                    {   value:' Poland'  ,   label:' Poland ' }   ,
                    {   value:' Portugal'    ,   label:' Portugal '   }   ,
                    {   value:' Qatar'   ,   label:' Qatar  ' }   ,
                    {   value:' Republic of Korea (South Korea)' ,   label:' Republic of Korea (South Korea) '}   ,
                    {   value:' Republic of Moldova' ,   label:' Republic of Moldova '}   ,
                    {   value:' Romania' ,   label:' Romania' }   ,
                    {   value:' Russian Federation'  ,   label:' Russian Federation ' }   ,
                    {   value:' Rwanda'  ,   label:' Rwanda ' }   ,
                    {   value:' Saint Kitts and Nevis'   ,   label:' Saint Kitts and Nevis'   }   ,
                    {   value:' Saint Lucia' ,   label:' Saint Lucia '}   ,
                    {   value:' Saint Vincent and the Grenadines'   ,   label:' Saint Vincent and the Grenadines '   }   ,
                    {   value:' Samoa'   ,   label:' Samoa '  }   ,
                    {   value:' San Marino'  ,   label:' San Marino'  }   ,
                    {   value:' Sao Tome and Principe'   ,   label:' Sao Tome and Principe  ' }   ,
                    {   value:' Saudi Arabia'    ,   label:' Saudi Arabia '   }   ,
                    {   value:' Senegal' ,   label:' Senegal' }   ,
                    {   value:' Serbia'  ,   label:' Serbia ' }   ,
                    {   value:' Seychelles'  ,   label:' Seychelles ' }   ,
                    {   value:' Sierra Leone'    ,   label:' Sierra Leone '   }   ,
                    {   value:' Singapore'   ,   label:' Singapore  ' }   ,
                    {   value:' Slovakia'    ,   label:' Slovakia  '  }   ,
                    {   value:' Slovenia'    ,   label:' Slovenia  '  }   ,
                    {   value:' Solomon Islands' ,   label:' Solomon Islands'  }  ,
                    {   value:' Somalia' ,   label:' Somalia ' }  ,
                    {   value:' South Africa'    ,   label:' South Africa '    }  ,
                    {   value:' South Sudan' ,   label:' South Sudan ' }  ,
                    {   value:' Spain'   ,   label:' Spain    '}  ,
                    {   value:' Sri Lanka'   ,   label:' Sri Lanka '   }  ,
                    {   value:' Sudan'   ,   label:' Sudan    '}  ,
                    {   value:' Suriname'    ,   label:' Suriname  '   }  ,
                    {   value:' Swaziland'   ,   label:' Swaziland  '  }  ,
                    {   value:' Sweden'  ,   label:' Sweden  ' }  ,
                    {   value:' Switzerland' ,   label:' Switzerland ' }  ,
                    {   value:' Syrian Arab Republic'    ,   label:' Syrian Arab Republic  '   }  ,
                    {   value:' Tajikistan'  ,   label:' Tajikistan'   }  ,
                    {   value:' Thailand'    ,   label:' Thailand '    }  ,
                    {   value:' Timor-Leste' ,   label:' Timor-Leste ' }  ,
                    {   value:' Togo'    ,   label:' Togo  '   }  ,
                    {   value:' Tonga'   ,   label:' Tonga '   }  ,
                    {   value:' Trinidad and Tobago' ,   label:' Trinidad and Tobago ' }  ,
                    {   value:' Tunisia' ,   label:' Tunisia ' }  ,
                    {   value:' Turkey'  ,   label:' Turkey  ' }  ,
                    {   value:' Turkmenistan'    ,   label:' Turkmenistan '    }  ,
                    {   value:' Tuvalu'  ,   label:' Tuvalu  ' }  ,
                    {   value:' Uganda'  ,   label:' Uganda  ' }  ,
                    {   value:' Ukraine' ,   label:' Ukraine  '}  ,
                    {   value:' United Arab Emirates'    ,   label:' United Arab Emirates  '   }  ,
                    {   value:' United Kingdom'    ,   label:' United Kingdom'   }  ,
                    {   value:' United Republic of Tanzania' ,   label:' United Republic of Tanzania ' }  ,
                    {   value:' United States of America'    ,   label:' United States of America   '  }  ,
                    {   value:' Uruguay' ,   label:' Uruguay ' }  ,
                    {   value:' Uzbekistan'  ,   label:' Uzbekistan '  }  ,
                    {   value:' Vanuatu' ,   label:' Vanuatu ' }  ,
                    {   value:' Venezuela'   ,   label:' Venezuela  '  }  ,
                    {   value:' Vietnam' ,   label:' Vietnam'  }  ,
                    {   value:' Yemen'   ,   label:' Yemen '   }  ,
                    {   value:' Zambia'  ,   label:' Zambia '  }  ,
                    {   value:' Zimbabwe'    ,   label:' Zimbabwe '    }  ,
                ])
                .attributes({ placeholder: 'Part of customer address. Please select from dropdown list.'})
                .validation({ required: true })
                .label('Country'),
                nga.field('zip_code', 'string')
                    .attributes({placeholder: 'Customer zip code', maxlength: 10})
                    .label('Zip code'),
            nga.field('telephone')
                .attributes({ placeholder: 'Customer phone number'})
                .validation({ required: true })
                .label('Telephone'),
            nga.field('template')
                .label('')
                .template(edit_button),
        ]);

    customerdata.editionView()
        .title('<h4>Customer Data<i class="fa fa-chevron-right" aria-hidden="true"></i>Edit: {{ entry.values.firstname }} {{ entry.values.lastname }} </h4>')
        .actions(['list'])
        .fields([
            customerdata.creationView().fields(),
 				nga.field('LoginData', 'referenced_list')
					.label('Login Data')
                    .targetEntity(admin.getEntity('LoginData'))
                    .targetReferenceField('customer_id')
                    .targetFields([
                        nga.field('username')
                            .label('Username'),
                        nga.field('force_upgrade' , 'boolean')
                            .label('Forced Upgrade'),
                        nga.field('account_lock' , 'boolean')
                            .label('Account Lock'),
                        nga.field('auto_timezone' , 'boolean')
                            .label('Auto TimeZone'),
                        nga.field('pin')
                            .label('Pin'),
                    ])
                    .listActions(['edit']),
                nga.field('ADD ACCOUNT', 'template')
                   .label('')
                   .template('<ma-create-button entity-name="LoginData" class="pull-right" label="ADD ACCOUNT" default-values="{ customer_id: entry.values.id }"></ma-create-button>'),
        ]);


	return customerdata;
	
}