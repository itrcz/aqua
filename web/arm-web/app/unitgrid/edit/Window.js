//Фильтр IP адреса
var ipAddress = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
Ext.apply(Ext.form.VTypes, {
    'ip': function(v) {
        var matches = ipAddress.exec(v);
        if (matches) {
            for (var i = 1; i <= 3; i++) {
                if (matches[i] && !(parseInt(matches[i], 10) < 256 && parseInt(matches[i], 10) >= 0)) {
                    return false;
                }
            }
            // the last octet should be greater than 0 and lesser than 255
            if (matches[4] && !(parseInt(matches[4], 10) < 255 && parseInt(matches[4], 10) > 0)) {
                return false;
            }
            return true;
        }
        return false;
    },
    'ipText': 'Не корректный IP адрес'
});

Ext.define('App.unitgrid.edit.Window', {
    extend: 'Ext.window.Window',

    title: 'Объект',
    layout: 'fit',
    modal: true,
    width: 600,
    minHeight: 500,
    autoShow: true,
    resizable: false,
    initComponent: function() {
        var me = this;
        var controller = App.getApplication().getController('App.unitgrid.Controller');

        Ext.applyIf(me, {
            items: [{
                xtype: 'form',
                items: {
                    xtype: 'tabpanel',
                    layoyt: 'fit',
                    bodyPadding: 10,
                    activeTab: 0,
                    items: [{
                            xtype: 'panel',
                            title: 'Основное',

                            id: 'unit_edit_tab_general',
                            items: [ //unit_edit_tab_general
                                    {
                                        xtype: 'fieldset',
                                        title: 'Скважина',
                                        items: [{
                                            xtype: 'textfield',
                                            fieldLabel: 'Заголовок',
                                            name: 'name',
                                            allowBlank: false,
                                            anchor: '100%',
                                            labelWidth: 150
                                        }, {
                                            xtype: 'textfield',
                                            fieldLabel: 'Владелец скважины',
                                            name: 'owner',
                                            allowBlank: false,
                                            anchor: '100%',
                                            labelWidth: 150
                                        }]
                                    },

                                ] //end of unit_edit_tab_general
                        }, {
                            xtype: 'panel',
                            title: 'Geo позиция',

                            id: 'unit_edit_tab_geo',
                            items: [{
                                    xtype: 'fieldset',
                                    title: 'Координаты',
                                    items: [{
                                        xtype: 'textfield',
                                        fieldLabel: 'Широта',
                                        name: 'lat',
                                        allowBlank: false,
                                        anchor: '100%',
                                        labelWidth: 150
                                    }, {
                                        xtype: 'textfield',
                                        fieldLabel: 'Долгота',
                                        name: 'lng',
                                        allowBlank: false,
                                        anchor: '100%',
                                        labelWidth: 150
                                    }]
                                }, {
                                    xtype: 'gmappanel',
                                    height: 300,
                                    onMapInit: function() {
                                        var map = this;

                                        var form = me.down("form");
                                        var val = form.getValues();

                                        //если не заданы координаты
                                        if (!val.lat || !val.lng) {
                                            val.lat = 55.75;
                                            val.lng = 37.62;

                                            form.getForm().findField("lat").setValue(val.lat);
                                            form.getForm().findField("lng").setValue(val.lng);
                                        }

                                        var cords = {
                                            lat: parseFloat(val.lat),
                                            lng: parseFloat(val.lng)
                                        };

                                        var marker = new google.maps.Marker({
                                            position: cords,
                                            map: this.gmap,
                                            draggable: true
                                        });

                                        marker.addListener('drag', function(event) {
                                            form.getForm().findField("lat").setValue(event.latLng.lat());
                                            form.getForm().findField("lng").setValue(event.latLng.lng());
                                        });

                                        marker.addListener('dragend', function(event) {
                                            var cords = {
                                                lat: parseFloat(event.latLng.lat()),
                                                lng: parseFloat(event.latLng.lng())
                                            };
                                            map.setCenter(cords);
                                        });

                                        setTimeout(function() {
                                            map.setCenter(cords);
                                        }, 1);
                                    }
                                }

                            ]
                        }, //конец вкладки unit_edit_tab_geo
                        {
                            xtype: 'panel',
                            title: 'Контроллер',
                            id: 'unit_edit_tab_controller',
                            items: [{
                                xtype: 'fieldset',
                                title: 'Настройки контроллера',
                                items: [{
                                    id: 'unit_edit_hw_model',
                                    xtype: 'combobox',
                                    editable: false,
                                    fieldLabel: 'Модель',
                                    store: Ext.create('Ext.data.Store', {
                                        fields: ['name', 'val'],
                                        data: [{
                                            "name": "0x01",
                                            "val": 1
                                        }, ]
                                    }),
                                    queryMode: 'local',
                                    displayField: 'name',
                                    valueField: 'val',
                                    value: 1,
                                    anchor: '100%',
                                    labelWidth: 150
                                }, {
                                    id: 'unit_edit_hw_serial',
                                    xtype: 'textfield',
                                    fieldLabel: 'Серийный номер',
                                    name: 'hw_serial',
                                    allowBlank: false,
                                    anchor: '70%',
                                    labelWidth: 150
                                }, {
                                    labelWidth: 150,
                                    xtype: 'combobox',
                                    editable: false,
                                    name: 'hw_conn_type',
                                    fieldLabel: 'Тип подключения',
                                    store: Ext.create('Ext.data.Store', {
                                        fields: ['name', 'val'],
                                        data: [{
                                            "name": "Последовательный порт",
                                            "val": "SERIAL"
                                        }, {
                                            "name": "GPRS",
                                            "val": "GPRS"
                                        }, ]
                                    }),
                                    queryMode: 'local',
                                    displayField: 'name',
                                    valueField: 'val',
                                    anchor: '70%',
                                    listeners: {
                                        change: function(el, val) {
                                            var unit_edit_gprs_settings = Ext.getCmp('unit_edit_gprs_settings');
                                            var unit_edit_comport_settings = Ext.getCmp('unit_edit_comport_settings');

                                            unit_edit_gprs_settings.setHidden(true);
                                            unit_edit_comport_settings.setHidden(true);

                                            switch (val) {
                                                case "GPRS":
                                                    unit_edit_gprs_settings.setHidden(false);
                                                    break;
                                                case "SERIAL":
                                                    unit_edit_comport_settings.setHidden(false);
                                                    break;
                                            }
                                        }
                                    }
                                }, {
                                    xtype: 'fieldset',
                                    title: 'Настройки подключения',
                                    items: [{ //start comport settings
                                                id: "unit_edit_gprs_settings",
                                                hidden: true,
                                                border: false,
                                                items: [{
                                                        xtype: 'textfield',
                                                        vtype: 'ip',
                                                        fieldLabel: 'IP адрес контроллера',
                                                        emptyText: "127.0.0.1",
                                                        name: 'hw_ipaddr',
                                                        allowBlank: false,
                                                        anchor: '70%',
                                                        labelWidth: 140
                                                    }, ] //end of gprs settings
                                            }, //end of gprs settings

                                            { //start comport settings
                                                id: "unit_edit_comport_settings",
                                                hidden: true,
                                                border: false,
                                                items: [{
                                                    layout: {
                                                        type: 'hbox',
                                                        pack: 'start',
                                                        align: 'stretch'
                                                    },

                                                    margin: '0 0 5 0',
                                                    border: false,
                                                    defaults: {
                                                        border: false
                                                    },
                                                    items: [{
                                                        flex: 1,
                                                        id: "unit_edit_hw_comport",
                                                        editable: false,
                                                        xtype: 'textfield',
                                                        fieldLabel: 'COM порт',
                                                        emptyText: "COM порт не определен",
                                                        name: 'hw_comport',
                                                        anchor: '70%',
                                                        labelWidth: 140,
                                                        margin: '0 5 0 0',
                                                    }, {
                                                        id:"HARDWARE_LOOKUP",
                                                        xtype: 'button',
                                                        text: 'Найти оборудование',
                                                    }]

                                                }, {
                                                    id: "unit_edit_hw_comspeed",
                                                    xtype: 'combobox',
                                                    editable: false,
                                                    fieldLabel: 'Скорость порта',
                                                    name: 'hw_comspeed',
                                                    store: Ext.create('Ext.data.Store', {
                                                        fields: ['name', 'val'],
                                                        data: [{
                                                            "name": "9600 бит/с",
                                                            "val": 9600
                                                        }, {
                                                            "name": "19200 бит/с",
                                                            "val": 19200
                                                        }, {
                                                            "name": "38400 бит/с",
                                                            "val": 38400
                                                        }, {
                                                            "name": "57600 бит/с",
                                                            "val": 57600
                                                        }, {
                                                            "name": "115200 бит/с",
                                                            "val": 115200
                                                        }, ]
                                                    }),
                                                    queryMode: 'local',
                                                    displayField: 'name',
                                                    valueField: 'val',
                                                    value: 1,
                                                    anchor: '70%',
                                                    labelWidth: 140
                                                }, ]

                                            }, //end comport settings
                                            {
                                                xtype: 'panel',
                                                border: 0,
                                                margin: '0 0 10 0',
                                                items: [{
                                                    xtype: 'button',
                                                    margin: '0 5 0 0',
                                                    text: 'Проверка связи',
                                                    listeners: {
                                                        click: function(me) {
                                                            Api.Controller.ping({}, function(data) {
                                                              if (data.success) {
                                                                Ext.MessageBox.alert('Проверка связи', "Успех!");
                                                              } else {
                                                                Ext.MessageBox.alert('Проверка связи', data.message);
                                                              }

                                                            });
                                                        }
                                                    }
                                                }, {
                                                    xtype: 'button',
                                                    margin: '0 5 0 0',
                                                    text: 'Синхронизация времени',
                                                    listeners: {
                                                        click: function(me) {
                                                          var data = me.up("form").getRecord().data;

                                                          Api.Controller.timeSync({
                                                            comport:data.hw_comport,
                                                            comspeed:data.hw_comspeed
                                                          }, function(data) {

                                                              if (data.success) {
                                                                Ext.MessageBox.alert('Синхронизация времени', "Успех!");
                                                              } else {
                                                                Ext.MessageBox.alert('Ошибка синхронизации времени', data.message);
                                                              }
                                                          });
                                                        }
                                                    }
                                                },{
                                                    xtype: 'button',
                                                    margin: '0 5 0 0',
                                                    text: 'Настройки оборудования',
                                                    listeners: {
                                                        click: function(me) {}
                                                    }
                                                }]
                                            }
                                        ] //end connection settings
                                }, {
                                    xtype: 'panel',
                                    border: 0,
                                    margin: '0 0 10 0',
                                    items: []
                                }]
                            }]

                        } //конец вкладки unit_edit_tab_controller

                    ]
                },
                dockedItems: [{
                    xtype: 'toolbar',
                    border: false,
                    dock: 'bottom',
                    items: [{
                            xtype: 'button',
                            text: 'УДАЛИТЬ',
                            //glyph:'xf014@FontAwesome',
                            cls: 'btn-red-dark',
                            id: 'ModalRemoveButtom',
                            hidden: true,
                            handler: function() {
                                controller.storeRemoveRecord(me);
                            }
                        },
                        '->', {
                            xtype: 'button',
                            text: 'Отмена',
                            handler: function() {
                                var win = this.up('window');
                                win.destroy();
                            }
                        }, {
                            xtype: 'button',
                            text: 'Сохранить',
                            //glyph:'xf00c@FontAwesome',
                            cls: 'btn-green',
                            handler: function() {
                                if (me.record) {
                                    controller.storeUpdateRecord(me);
                                } else {
                                    controller.storeAddRecord(me);
                                }

                            }

                        },
                    ]
                }]
            }, ],

        });

        me.callParent(arguments);
        if (me.record) {
            Ext.getCmp('ModalRemoveButtom').setHidden(false);
            me.down('form').loadRecord(me.record);
        }
    }

});
