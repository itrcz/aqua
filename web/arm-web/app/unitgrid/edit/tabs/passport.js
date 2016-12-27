Ext.define("App.unitgrid.edit.tabs.passport", {
	extend: 'Ext.panel.Panel',

	xtype: 'panel',
	title: 'Паспорт',
	alias: 'unitgrid_edit_tab_passport',
	items: {
		xtype: 'fieldset',
		title: 'Скважина',
		items: [{
			xtype: 'textfield',
			fieldLabel: 'Наименование субъекта',
			name: 'name',
			cls:'fffff',
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
		}, {
			xtype: 'numberfield',
			fieldLabel: 'Номер скважины',
			name: 'well_num',
			allowBlank: false,
			anchor: '100%',
			labelWidth: 150
		}, {
			xtype: 'numberfield',
			fieldLabel: 'Кадастровый номер скважины',
			name: 'well_num_cadastral',
			allowBlank: false,
			anchor: '100%',
			labelWidth: 150
		}, {
			xtype: 'numberfield',
			fieldLabel: 'Год бурения',
			name: 'well_drill_year',
			allowBlank: false,
			anchor: '100%',
			labelWidth: 150
		}, {
			xtype: 'combobox',
			editable: false,
			fieldLabel: 'Назначение скважины',
			name: 'well_type',
			store: Ext.create('Ext.data.Store', {
				fields: ['name', 'val'],
				data: [{
					"name": "Промышленная",
					"val": 1
				}, {
					"name": "Питьевое",
					"val": 2
				}]
			}),
			queryMode: 'local',
			displayField: 'name',
			valueField: 'val',
			value: 1,
			labelWidth: 150
		}]
	}
});