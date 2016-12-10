Ext.define('App.unitgrid.edit.hardware.Window', {
    extend: 'Ext.window.Window',
    title: 'Поиск оборудования',
    layout: 'fit',
    modal: true,
    width: 580,
    minHeight: 300,
    autoShow: true,
    resizable: false,
    padding:"10 10 5 10",
    items:[
      {
        xtype:"grid",
        id: 'HardwareLookupGrid',
        allowDeselect : true,
        dockedItems : [
             {
                 xtype : 'toolbar',
                 dock  : 'bottom',
                 items : [
                     {
                         text     : 'Обновить',
                         listeners: {
                     	      click : function(button){
                                button.up("grid").getStore().load();
                            }
                         }
                     }
                 ]
             }
         ],
        emptyText:"Поиск оборудования...",
        deferEmptyText: false,
        store: {
            type: 'hardwareLookup'
        },
        columns: [
            { text: 'S/N', dataIndex: 'sn', flex: 1 },
            { text: 'Устройство', dataIndex: 'name', flex: 3 },
            { text: 'Порт', dataIndex: 'com', flex: 2 },
        ],
        listeners: {
    	    render : function(grid){
               var store = grid.getStore();
			   
               store.getProxy().setExtraParam('comspeed',Ext.getCmp("unit_edit_hw_comspeed").value);

               store.load();
          },
          itemclick : function(button){
              var selectBtn = Ext.getCmp("hardware_select_button");
              selectBtn.enable();
          }
        }
      }
    ],
    dockedItems: [{
        xtype: 'toolbar',
        border: false,
        dock: 'bottom',
        items: [
            '->', {
                xtype: 'button',
                text: 'Отмена',
                handler: function() {
                    var win = this.up('window');
                    win.destroy();
                }
            }, {
                xtype: 'button',
                id:"hardware_select_button",
                text: 'Выбрать',
                //glyph:'xf00c@FontAwesome',
                cls: 'btn-green',
                handler: function() {

                },
                disabled : true,
                handler: function() {
                    var grid = Ext.getCmp('HardwareLookupGrid');
                    var sel = grid.getSelection()[0];
                    if (sel) {
                      var data = sel.data;
                      Ext.getCmp("unit_edit_hw_comport").setValue(data.com);
                      Ext.getCmp("unit_edit_hw_serial").setValue(data.sn);
                      Ext.getCmp("unit_edit_hw_model").setValue(data.name);

                      this.up('window').destroy();
                    }
                }

            },
        ]
    }]
});
