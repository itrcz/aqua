Ext.define('App.log.commutication.View', {
    extend: 'Ext.grid.Panel',
    xtype: 'log_communication_view',
    border:0,
    flex:1,
    requires: [
      'App.log.commutication.Store'
    ],
    store: {
        type: 'log_commutication_store'
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
