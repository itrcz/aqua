Ext.define('App.geo.map.View', {
	extend: 'Ext.Panel',
	xtype:'maps',
	id: "MapView",

	map: null,//Yandex map object

	layout:'fit',
	initComponent : function(){

		this.viewController = App.getApplication().getController('App.geo.map.Controller');

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

		this.callParent();

		if (this.map) {
			this.viewController.mapReady(this);
		}
	},
	getMap : function() {
		if (!this.map) return false;
		return this.map;
	},
	getCenter : function(){
		if (!this.map) return;
		return this.map.getCenter();
	},
	setCenter : function(opt){
		if (!this.map) return;

		if (opt.lat && opt.lng) {
			this.map.setCenter([opt.lat, opt.lng]);
		}
	},
	afterComponentLayout : function(w, h){
		if (!this.map) return;
		
		this.map.container.fitToViewport();

		this.callParent(arguments);
	},
});
