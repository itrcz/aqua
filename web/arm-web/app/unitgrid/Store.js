Ext.define('App.unitgrid.Store', {
    extend: 'Ext.data.Store',

    alias: 'store.unitgrid',

    model:'App.unitgrid.Model',
	
	autoLoad:false,
	autoSync:false,
	
    proxy: {
        type: 'direct',
		api: {
            create:	Api.Unit.create,
            read:	Api.Unit.read,
            update:	Api.Unit.update,
            destroy:Api.Unit.destroy
        },
        writer: {
	        writeAllFields: true
        },
        listeners : {
			exception : function(proxy, response, operation) {
				
				if (operation) {
					Ext.MessageBox.alert('Ошибка сохранения', response.data.message);
				}
			}
		}
    }
});
