/**
 * This view is an example list of people.
 */
Ext.define('App.commLog.View', {
    extend: 'Ext.grid.Panel',
    xtype: 'welllist',
	
	id:"commLog",
	
    requires: [
        'App.commLog.Store'
    ],

    title: 'Журнал связи',

    store: {
        type: 'commLog'
    },

    columns: [
        { text: 'Время',  dataIndex: 'timestamp', width: 200, sortable: true, renderer: Ext.util.Format.dateRenderer('m/d/Y H:m:s')},
        { text: 'Тип', dataIndex: 'type', flex: 1 },
        { text: 'Событие', dataIndex: 'msg', flex: 1 }
    ],

    listeners: {
	    render : function(grid){      
           var store = grid.getStore();
           store.load();
       }
       // select: 'onItemSelected'
    }
});
