Ext.define('App.log.View', {
    extend: 'Ext.tab.Panel',
    
    layout: 'fit',
    title: 'Журнал событий',
    items:[{
        title:"Основные события",
        layout: 'fit',
        items: {
            xtype: "log_global_view"
        }
    },
    {
        title:"События связи",
        layout: 'fit',
        items: {
            xtype: "log_communication_view"
        }
    }]
});