Ext.define('App.log.global.Store', {
    extend: 'Ext.data.Store',

    alias: 'store.log_global_store',

    fields: [
        'timestamp', 'username', 'action', 'ipaddr', 
    ],
	
	autoLoad:false,
	
    proxy: {
        type: 'direct',
        directFn:Api.Log.read,
		//api: {
        //    create:	Api.Log.create,
        //    read:	Api.Log.read,
        //    update:	Api.Log.update,
        //    destroy:Api.Log.destroy
        //},
        listeners : {
			exception : function(proxy, response, operation) {
				if (operation) {
					Ext.MessageBox.alert('Ошибка сохранения', response.data.message);
				}
			}
		}
    }
});
