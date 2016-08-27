Ext.define('App.settings.services.Store', {
    extend: 'Ext.data.Store',

    alias: 'store.services',

    fields: [
        'name', 'service', 'status'
    ],
	
	autoLoad:false,
	
    proxy: {
        type: 'direct',
        directFn:Api.Services.read,
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
