Ext.define('App.reports.Controller', {
	extend: 'Ext.app.Controller',
	

	init: function() {
		
		var MenuController = App.getApplication().getController('App.mainmenu.Controller');
		var controller = this;


		MenuController.addMenuItem({
			name:'Отчеты',
			glyph:'icon-reports',
			glyphColor:'gray',
			module:'reports',
		});
/*
		this.control({
            "#NEW_ADDRESSBOOK_RECORD": {
	            click: this.newRecord
	        },
	        "#AddressbookGrid": {
	            itemdblclick: this.editRecord
	        }
	    });
*/

	},
	

});