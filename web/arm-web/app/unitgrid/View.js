/**
 * This view is an example list of people.
 */
Ext.define('App.unitgrid.View', {
    extend: 'Ext.grid.Panel',
    xtype: 'welllist',

    flex:1,
    
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
        val = '<span class="badge badge-red icon-unlink">Нет связи</span>';
        if (availability)
          val = '<span class="badge badge-greem icon-link">Онлайн</span>';

		    return val;
	    }},
        { text: 'Номер',  dataIndex: 'id' },
        { text: 'Имя', dataIndex: 'name', flex: 1 },
        { text: 'Владелец', dataIndex: 'owner', flex: 1 },
        { text: 'Серийный номер', dataIndex: 'hw_serial', flex: 1 },
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
