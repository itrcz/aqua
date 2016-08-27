Ext.application({
	name : 'App',
	appFolder : 'app',
    enableQuickTips: true,
	requires: [
	    "Plugins.SocketProvider",
		"Plugins.GMapPanel",
		"Ext.tab.Panel",
	],
    constrollers: [
	    "App.mainmenu.Controller",
    ],
    launch: function () {
	    
	    Ext.create('App.Viewport');
		Ext.create("Plugins.Debug").init({enable:true});
	
		if (window.apiData) {
			
			Ext.direct.Manager.addProvider({
			    id          : 'providerid',
			    type        : 'socketio',
			    namespace   : 'Api',
			    socket		: window.socket,
			    actions     : window.apiData
			});
			
			App.app.getController('App.unitgrid.Controller');		
			App.app.getController('App.geo.Controller');
			App.app.getController('App.reports.Controller');
			App.app.getController('App.log.Controller');
			App.app.getController('App.settings.Controller');

		}
    }
});
