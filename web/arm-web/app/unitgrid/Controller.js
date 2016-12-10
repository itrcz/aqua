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
			"#HARDWARE_PING": {
                click: this.pingHardware
            },
            "#HARDWARE_LOOKUP": {
                click: this.lookupForHardware
            },
             "#HARDWARE_SET_SN": {
                click: this.setSnHardware
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
    /*
	    Проверка взязи с устройтсвом
    */
	pingHardware: function(button) {
		Api.Controller.ping({
			comport: Ext.getCmp("unit_edit_hw_comport").value,
			comspeed: Ext.getCmp("unit_edit_hw_comspeed").value,
		}, function(data) {
			if (data.success) {
				Ext.MessageBox.alert('Проверка связи', "Успех!");
		    } else {
				Ext.MessageBox.alert('Проверка связи', data.message);
			}
		});
	},
	lookupForHardware: function(button) {
		Ext.create('App.unitgrid.edit.hardware.Window');
	},
	setSnHardware: function(button) {
		Api.Controller.setSn({
			comport: Ext.getCmp("unit_edit_hw_comport").value,
			comspeed: Ext.getCmp("unit_edit_hw_comspeed").value,
			sn: Ext.getCmp("unit_edit_hw_serial").value,
		}, function(data) {
			if (data.success) {
				Ext.MessageBox.alert('Установка SN', "Успех!");
		    } else {
				Ext.MessageBox.alert('Установка SN', data.message);
			}
		});
	},
});
