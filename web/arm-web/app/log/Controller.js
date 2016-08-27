/*
	CONFERENCE CONTROLLER
*/
Ext.define('App.log.Controller', {
	extend: 'Ext.app.Controller',
	
	views: 	['App.log.View'],
	//models:	['pbxe.module.addressbook.Model','pbxe.module.addressbook.edit.PhoneModel'],
	stores:	['App.log.Store'],
	
	init: function() {

		var MenuController = App.getApplication().getController('App.mainmenu.Controller');
		var controller = this;


		MenuController.addMenuItem({
			name:'Журнал событий',
			glyph:'icon-coverflow',
			glyphColor:'gray',
			module:'log',
		});
	},

	

});