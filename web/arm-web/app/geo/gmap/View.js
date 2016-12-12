Ext.define('App.geo.gmap.View', {
    extend: 'Ext.Panel',
    xtype:'geo_gmap',
    id: "GeoView",
    gmap: null,

    initComponent : function(){
        this.viewController = App.getApplication().getController('App.geo.gmap.Controller');

        var defConfig = {
	        gconfig: {
	            plain: true,
	            yaw: 180,
	            pitch: 0,
	            zoom: 10,
	            border: false,
	            center: {
		          	lat: 55.74947,
				  	lng: 37.35232
	            },

	        }
        };

        Ext.applyIf(this,defConfig);

        this.callParent();


    },


    afterRender : function(){

        var wh = this.ownerCt.getSize(),
            point;

        Ext.applyIf(this, wh);

        this.callParent();

		this.gmap = new google.maps.Map(this.body.dom, this.gconfig);



		var map_style = [{"featureType":"landscape.man_made","elementType":"geometry","stylers":[{"color":"#f7f1df"}]},{"featureType":"landscape.natural","elementType":"geometry","stylers":[{"color":"#f7f1df"}]},{"featureType":"landscape.natural.terrain","elementType":"geometry","stylers":[{"visibility":"off"}]},{"featureType":"poi","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"poi.business","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"poi.medical","elementType":"geometry","stylers":[{"color":"#fbd3da"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#bde6ab"}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"off"}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#ffe15f"}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#efd151"}]},{"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"road.local","elementType":"geometry.fill","stylers":[{"color":"black"}]},{"featureType":"transit.station.airport","elementType":"geometry.fill","stylers":[{"color":"#cfb2db"}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#a2daf2"}]}];

		//this.gmap.set('styles',map_style);


		this.viewController.afterRender(this);
    },
    getMap : function() {
        return this.gmap;
    },
    getCenter : function(){
        return this.getMap().getCenter();
    },
    setCenter : function(opt){
	    if (opt.lat && opt.lng) {
		    this.gmap.setCenter(opt);
	    }
    },
    getCenterLatLng : function(){
        var crd = this.getCenter();
        return {lat: crd.lat(), lng: crd.lng()};
    },

    afterComponentLayout : function(w, h){
        this.callParent(arguments);
        var map = this.gmap;
        if (map) {
            google.maps.event.trigger(map, 'resize');
        }

    },


});
