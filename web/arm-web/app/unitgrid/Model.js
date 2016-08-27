Ext.define('App.unitgrid.Model', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'id', type:'int' },
        { name: 'name' },
        { name: 'owner' },
        { name: 'lat' },
        { name: 'lng' },
        { name: 'hw_serial' },
        { name: 'hw_availability' }
    ]
});