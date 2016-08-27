Ext.define('App.reports.Store', {
    extend: 'Ext.data.Store',

    alias: 'store.reports',

    fields: [
        'lvl', 'recordDate'
    ],
	
	autoLoad:true,
	
    proxy: {
        type: 'direct',
        directFn:Api.Unit.readChart,
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
