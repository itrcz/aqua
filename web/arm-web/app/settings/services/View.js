/**
 * This view is an example list of people.
 */
Ext.define('App.settings.services.View', {
    extend: 'Ext.grid.Panel',
    xtype: 'serviceslist',
	
	id:"log",
	
    requires: [
        'App.settings.services.Store'
    ],

    title: 'Службы',

    store: {
        type: 'services'
    },

    columns: [
    	{ text: 'Название', dataIndex: 'name', flex: 3 },
    	{ text: 'Служба', dataIndex: 'service', flex: 2 },
		{ text: 'Статус', dataIndex: 'status', flex: 3, renderer:function(val,meta,rec){
			
			meta.tdCls += " service";
			
			switch(val) {
				case 0:
					meta.tdCls += " up";
					return "Работает";
					break;
				case -1:
					meta.tdCls += " down";
					return "Остановлена";
					break;
				case 1:
					meta.tdCls += " starting";
					return "Запускается";
					break;
			}
		}},
		{
            xtype:'actioncolumn',
            width:50,
            items: [{
                icon: '/images/services/restart.png',
                text:'text',
                title:'title',
                tooltip: 'Перезапустить',
                handler: function(grid, rowIndex, colIndex) {
                    var rec = grid.getStore().getAt(rowIndex);
                    Ext.Msg.show({
					    title:'Перезапуск службы',
					    message: 'Служба '+rec.get('service')+' будет остановлена, все процессы выполняемые данной службой будут прерваны, вы уверены, что хотите продолжить?',
					    buttons: Ext.Msg.YESNO,
					     buttonText: {
					          yes   : 'Отмена',   
					               
					          no   : 'ПЕРЕЗАПУСТИТЬ'    
					      },


					    icon: Ext.Msg.QUESTION,
					    fn: function(btn) {
					        if (btn === 'no') {
					            Api.Services.restart({service: rec.get('service') },function(data){
								
                    			});
					        }
					    }
					});
                }
            }]
        }

    ],

    listeners: {
	    render : function(grid){      
           var store = grid.getStore();
           store.load();
       }
       // select: 'onItemSelected'
    }
});
