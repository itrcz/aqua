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


// Ext.require('App.unitgrid.edit.tabs.passport', function() {

// })
Ext.define('App.unitgrid.edit.Window', {
	extend: 'Ext.window.Window',
	requires: [
		'App.unitgrid.edit.tabs.passport'
	],
	
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
							items: [
									Ext.require('App.unitgrid.edit.tabs.passport')
								, {
									xtype: 'panel',
									title: 'Гео позиция',

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
										xtype: 'mappanel',
										height: 300,
										onMapReady: function(map) {
											var form = me.down("form");
											var val = form.getValues();

											//если не заданы координаты
											if (!val.lat || !val.lng) {
												val.lat = 55.75;
												val.lng = 37.62;

												form.getForm().findField("lat").setValue(val.lat);
												form.getForm().findField("lng").setValue(val.lng);
											}

											var cords = [parseFloat(val.lat), parseFloat(val.lng)];

											var marker = new ymaps.Placemark(cords, {}, {preset: "islands#blueWaterParkCircleIcon",draggable: true});

											map.geoObjects.add( marker );	

		
											
											marker.events.add("drag",function(e){
												var coords = e.get('target').geometry.getCoordinates();
												form.getForm().findField("lat").setValue(coords[0]);
												form.getForm().findField("lng").setValue(coords[1]);
											});

											marker.events.add("dragend",function(e){
												var coords = e.get('target').geometry.getCoordinates();

												map.setCenter(coords);
											});
											
											setTimeout(function() {
												map.setCenter(cords);
											}, 1);
										}
									}]
								}, //конец вкладки unit_edit_tab_geo
							{
								xtype: 'panel',
								title: 'Характеристики',
								id: 'unit_edit_tab_specs',
								items: //unit_edit_tab_general
									[{
										xtype: 'fieldset',
										title: 'Конструкция оборудования',
										items: [{
												xtype: 'numberfield',
												fieldLabel: 'Диаметр колонны (мм)',
												allowBlank: false,
												anchor: '100%',
												labelWidth: 150
											},{
												xtype: 'numberfield',
												fieldLabel: 'Глубина установки (м)',
												allowBlank: false,
												anchor: '100%',
												labelWidth: 150
											},{
												xtype: 'numberfield',
												fieldLabel: 'Дебет Q (м/с)',
												allowBlank: false,
												anchor: '100%',
												labelWidth: 150
											},{
												xtype: 'numberfield',
												fieldLabel: 'Удельный дебет (л/с)',
												allowBlank: false,
												anchor: '100%',
												labelWidth: 150
											},{
												xtype: 'numberfield',
												fieldLabel: 'Уровень статический (м)',
												allowBlank: false,
												anchor: '100%',
												labelWidth: 150
											},{
												xtype: 'numberfield',
												fieldLabel: 'Уровень динамический (м)',
												allowBlank: false,
												anchor: '100%',
												labelWidth: 150
											}]
									
									}] //e
							},
							{
								xtype: 'panel',
								title: 'Настройки связи',
								id: 'unit_edit_tab_controller',
								items: [{
									xtype: 'fieldset',
									title: 'Настройки подключения',
									items: [{
										id: 'unit_edit_hw_model',
										xtype: 'combobox',
										editable: false,
										fieldLabel: 'Концентратор данных',
										store: Ext.create('Ext.data.Store', {
											fields: ['name', 'val'],
											data: [{
												"name": "AquaMonitor",
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
										xtype: 'fieldset',
										title: 'Настройки PUSH',
										items: [{
											xtype: 'checkbox',
											name: 'hw_allow_push',
											inputValue: 1,
											uncheckedValue: 0,
											fieldLabel: 'Включен',
										}]
									}, {
										xtype: 'fieldset',
										title: 'Настройки конфигурирования',
										items: [{ //start comport settings
													id: "unit_edit_comport_settings",
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
															id: "HARDWARE_LOOKUP",
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
														id: "HARDWARE_PING",
														xtype: 'button',
														margin: '0 5 0 0',
														text: 'Проверка связи',
													}, {
														xtype: 'button',
														margin: '0 5 0 0',
														text: 'Синхронизация времени',
														listeners: {
															click: function(me) {
																var data = me.up("form").getRecord().data;

																Api.Controller.timeSync({
																	comport: data.hw_comport,
																	comspeed: data.hw_comspeed
																}, function(data) {

																	if (data.success) {
																		Ext.MessageBox.alert('Синхронизация времени', "Успех!");
																	} else {
																		Ext.MessageBox.alert('Ошибка синхронизации времени', data.message);
																	}
																});
															}
														}
													}, {
														id: "HARDWARE_SET_SN",
														xtype: 'button',
														margin: '0 5 0 0',
														text: 'Set SN',

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
									var win = Ext.create('Ext.window.MessageBox', {
									     width:300,
									     height: 100,
									     buttons: [
									      {text: 'Удалить', cls: 'btn-red-dark'},
									      { text: 'Отмена'}
									    ]
									});
									win.show({
									     title:'Удаление объекта',
									     msg: 'Все данные по данному объекту будут удалены, вы уверены, что хотите продолжить?',
									    icon: Ext.Msg.QUESTION,
									    fn: function(rer){
									    	console.log(rer);

									    	return;

									     	controller.storeRemoveRecord(me)
									     },
									});
									
								
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
				},
			],

		});

	me.callParent(arguments);
	if (me.record) {
		Ext.getCmp('ModalRemoveButtom').setHidden(false);
		me.down('form').loadRecord(me.record);
	}
}

});