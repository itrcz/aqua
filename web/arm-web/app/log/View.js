Ext.define('App.log.View', {
    extend: 'Ext.grid.Panel',
    xtype: 'welllist',
	
	id:"log",
	
    requires: [
        'App.log.Store'
    ],

    title: 'Журнал событий',

    store: {
        type: 'log'
    },

    columns: [
        { text: 'Время',  dataIndex: 'timestamp', width: 200, sortable: true, renderer: Ext.util.Format.dateRenderer('m/d/Y H:m:s')},
        { text: 'Пользователь', dataIndex: 'username', flex: 1 },
        { text: 'Событие', dataIndex: 'action', flex: 1 },
        { text: 'IP адресс', dataIndex: 'ipaddr', flex: 1 }
    ],

    listeners: {
	    render : function(grid){      
           var store = grid.getStore();
           store.load();
       }
       // select: 'onItemSelected'
    }
});
