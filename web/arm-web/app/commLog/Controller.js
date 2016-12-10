
Ext.define('App.commLog.Controller', {
	extend: 'Ext.app.Controller',
	
	views: 	['App.commLog.View'],
	//models:	['pbxe.module.addressbook.Model','pbxe.module.addressbook.edit.PhoneModel'],
	stores:	['App.commLog.Store'],
	
	init: function() {

		var MenuController = App.getApplication().getController('App.mainmenu.Controller');
		var controller = this;


		MenuController.addMenuItem({
			name:'Журнал cвязи',
			glyph:'icon-coverflow',
			glyphColor:'gray',
			module:'commLog',
		});
	},

	

});