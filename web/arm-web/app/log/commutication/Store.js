Ext.define('App.log.commutication.Store', {
    extend: 'Ext.data.Store',

    alias: 'store.log_commutication_store',
    
    fields: [
        'timestamp', 'msg', 'type', 
    ],
    
    autoLoad:false,
    
    proxy: {
        type: 'direct',
        directFn:Api.CommLog.read,
        listeners : {
            exception : function(proxy, response, operation) {
                if (operation) {
                    Ext.MessageBox.alert('Ошибка сохранения', response.data.message);
                }
            }
        }
    }
});
