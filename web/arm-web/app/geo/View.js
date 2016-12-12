Ext.define('App.geo.View', {
    extend: 'Ext.Panel',
    xtype: 'geo',
    title: 'Карта',
    layout:'fit',
    dockedItems: [{
        xtype: 'toolbar',
        dock: 'top',
        border:0,
        padding: "10 10 10 10",
        items: [
            ,'-',
            {
                xtype: 'combobox',
                editable: false,
                fieldLabel: 'Район',
                queryMode: 'local',
                displayField: 'name',
                valueField: 'val',
                value: 0,
                labelWidth: 60,
                store: Ext.create('Ext.data.Store', {
                    fields: ['name', 'val'],
                    data: [{
                        "name": "Москва и МО",
                        "val": 0
                    }]
                })
            },
            '->',
            {
                xtype    : 'textfield',
                name     : 'field',
                emptyText: 'Найти'
            }
        ]
    }],


    items: [
    {
      xtype:'geo_gmap',

    }]

});
