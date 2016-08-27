Ext.define('App.settings.Controller', {
	extend: 'Ext.app.Controller',
	
	
	stores:	['App.settings.services.Store'],
	views: 	['App.settings.services.View'],

	init: function() {
		
		var MenuController = App.getApplication().getController('App.mainmenu.Controller');
		var controller = this;


		MenuController.addMenuItem({
			name:'Настройки',
			glyph:'icon-settings',
			glyphColor:'gray',
			module:'settings',
		});
		


	},
	

});