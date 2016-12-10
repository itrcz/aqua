Ext.define('App.commLog.Store', {
    extend: 'Ext.data.Store',

    alias: 'store.commLog',

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
