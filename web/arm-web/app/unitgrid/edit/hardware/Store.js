Ext.define('App.unitgrid.edit.hardware.Store', {
    extend: 'Ext.data.Store',
    alias: 'store.hardwareLookup',
    model:'App.unitgrid.edit.hardware.Model',
    autoLoad:false,
    autoSync:false,
    proxy: {
        type: 'direct',
		    directFn: Api.Controller.findHardware,
        writer: {
	        writeAllFields: true
        },
        listeners : {
          exception : function(proxy, response, operation) {
            if (operation) {
              Ext.MessageBox.alert('Поиск устройств', response.data.message);
            }
          }
        }
    }
});
