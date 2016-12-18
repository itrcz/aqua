Ext.define('Plugins.MapPanel', {
    extend: 'Ext.panel.Panel',
    
    alias: 'widget.mappanel',
    
    map: null,//Yandex map object

    layout:'fit',
    initComponent : function(){

        this.callParent();
    },
    afterRender : function(){
        if (ymaps) {
            this.map = new ymaps.Map(this.body.dom, {
                center: [55.76, 37.64], 
                zoom: 10,
                controls: ['zoomControl', 'searchControl', 'typeSelector',  'fullscreenControl']
            });
        }
        Ext.applyIf(this, this.ownerCt.getSize());

        //Если есть функция передаем в нее готовую карту
        if(typeof(this.onMapReady) === "function")
        {
            this.onMapReady(this.map);
        }

        this.callParent();
    },
    getMap: function() {
        if (!this.map) return false;
        return this.map;
    },
    getCenter: function(){
        if (!this.map) return;
        return this.map.getCenter();
    },
    setCenter: function(coords){
        if (!this.map) return;
        this.map.setCenter(coords);
    },
    afterComponentLayout: function(w, h){
        if (!this.map) return;
        
        this.map.container.fitToViewport();

        this.callParent(arguments);
    },
});
