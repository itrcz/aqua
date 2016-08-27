/**
 * @author Shea Frederick
 */
Ext.define('Plugins.GMapPanel', {
    extend: 'Ext.panel.Panel',
    
    alias: 'widget.gmappanel',
    
    requires: ['Ext.window.MessageBox'],
     gmap: null,
    
    initComponent : function(){

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
		
		if(typeof(this.onMapInit) === "function") {
			this.onMapInit();
		}
		
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