Ext.define('App.geo.Controller', {
    extend: 'Ext.app.Controller',
    views: 	['App.geo.View'],
    requires: [
        'App.geo.gmap.Controller',
        'App.unitgrid.Store'
    ],
    init: function() {
        App.getApplication().getController('App.mainmenu.Controller').addMenuItem({
            name:'Карта',
            glyph:'icon-location',
            glyphColor:'green',
            module:'geo',
        });
        var controller = this;
        this.control({
            "#IDITEM": {
                itemdblclick: this.Func
            }
        });
    },
});
