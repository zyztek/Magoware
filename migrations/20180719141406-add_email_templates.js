'use strict';

module.exports = {
    up: function (queryInterface, Sequelize) {
        queryInterface.createTable('email_templates', {
                id: {
                    type: Sequelize.INTEGER(11),
                    allowNull: false,
                    primaryKey: true,
                    autoIncrement: true,
                    unique: true
                },
                template_id: {
                    type: Sequelize.STRING(200),
                    allowNull: false,
                    defaultValue: "code-pin-email,new-account,new-email,reset-password-email,reset-password-confirm-email,reset-password-email,reset-password-enter-password,salesreport-invoice",
                    unique: 'templateid_language'
                },
                title: {
                    type: Sequelize.STRING(100),
                    allowNull: false
                },
                language: {
                    type: Sequelize.STRING(20),
                    allowNull: false,
                    unique: 'templateid_language'
                },
                content: {
                    type: Sequelize.STRING(5000),
                    allowNull: false
                }
            },
            {
                uniqueKeys: {
                    templateid_language: {fields: ['template_id', 'language']}
                }
            })
            .catch(function(err) {console.log('Creating new table email_templates failed with error message: ',err.message);});
    },

    down: function (queryInterface, Sequelize) {
        queryInterface.dropTable('email_templates')
            .catch(function(err) {console.log('Deleting the table email_templates failed with error message: ',err.message);});
    }

};

