/**
 * This view is an example list of people.
 */
Ext.define('App.unitgrid.View', {
    extend: 'Ext.grid.Panel',
    xtype: 'welllist',

	id:"UnitGrid",

    requires: [
        'App.unitgrid.Store'
    ],

    title: 'Объекты',

    store: {
        type: 'unitgrid'
    },

    columns: [
	    { text: 'Статус подключения', dataIndex: 'hw_availability', flex: 1, renderer: function(availability) {
        val = '<span class="unit_status offline">Нет связи</span>';
        if (availability)
          val = '<span class="unit_status online">Онлайн</span>';

		    return val;
	    }},
        { text: 'Ид',  dataIndex: 'id' },
        { text: 'Имя', dataIndex: 'name', flex: 1 },
        { text: 'Владелец', dataIndex: 'owner', flex: 1 },
        { text: 'Серийны номер контроллера', dataIndex: 'hw_serial', flex: 1 },
        { text: 'Широта', dataIndex: 'lat', flex: 1 },
        { text: 'Долгота', dataIndex: 'lng', flex: 1 },
    ],
	dockedItems: [{
	    xtype: 'toolbar',
	    dock: 'bottom',
	        items: [{
	            xtype: 'button',
	            text: 'Добавить объект',
				cls:'btn-green',
	            itemId: 'NEW_UNIT',
	        },
	    ]
	}],
    listeners: {
	    render : function(grid){
           var store = grid.getStore();
           store.load();
       }
       // select: 'onItemSelected'
    }
});
