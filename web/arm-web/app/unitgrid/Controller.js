/*
	CONFERENCE CONTROLLER
*/
Ext.define('App.unitgrid.Controller', {
    extend: 'Ext.app.Controller',

    id: "UnitController",

    views: ['App.unitgrid.View'],
    //models:	['pbxe.module.addressbook.Model','pbxe.module.addressbook.edit.PhoneModel'],
    stores: ['App.unitgrid.Store','App.unitgrid.edit.hardware.Store'],

    init: function() {

        var MenuController = App.getApplication().getController('App.mainmenu.Controller');
        var controller = this;


        MenuController.addMenuItem({
            name: 'Объекты',
            glyph: 'icon-objects',
            glyphColor: 'gray',
            module: 'unitgrid',
        });

        this.control({
            // "#NEW_ADDRESSBOOK_RECORD": {
            //     click: this.newRecord
            // },
            "#UnitGrid": {
                itemdblclick: this.editRecord
            },
            "#NEW_UNIT": {
                click: this.addRecord
            },
						"#HARDWARE_LOOKUP": {
                click: this.lookupForHardware
            },
        });


    },

    addRecord: function(self, record, item, index, e, eOpts) {
        Ext.create('App.unitgrid.edit.Window');
    },
    editRecord: function(self, record, item, index, e, eOpts) {
        Ext.create('App.unitgrid.edit.Window', {
            record: record
        });
    },

    storeAddRecord: function(window) {
        var store = Ext.getCmp("UnitGrid").getStore();

        var form = window.down('form');

        var values = form.getValues();

        var record = Ext.create("App.unitgrid.Model", values);

        store.add(record);

        store.sync({
            success: function() {
                window.destroy();
            },
            failure: function() {
                store.rejectChanges();
            }
        });
    },
    storeUpdateRecord: function(window) {

        var store = Ext.getCmp("UnitGrid").getStore();

        var form = window.down('form');

        var record = form.getRecord();
        var values = form.getValues();

        if (record) {

            record.set(values);

            store.sync({
                success: function() {
                    window.destroy();
                },
                failure: function() {
                    store.rejectChanges();
                }
            });
        }
    },
    storeRemoveRecord: function(window) {

        var store = Ext.getCmp("UnitGrid").getStore();

        var form = window.down('form');

        var record = form.getRecord();

        if (record) {

            store.remove(record);

            store.sync({
                success: function() {
                    window.destroy();
                },
                failure: function() {
                    store.rejectChanges();
                }
            });
        }
    },
		lookupForHardware: function(button) {
				Ext.create('App.unitgrid.edit.hardware.Window');
		}
});
