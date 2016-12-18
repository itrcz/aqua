Ext.define('App.log.global.View', {
    extend: 'Ext.grid.Panel',
    xtype: 'log_global_view',
    border:0,
    flex:1,
    requires: [
      'App.log.global.Store'
    ],
    store: {
        type: 'log_global_store'
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