Ext.define('App.mainmenu.Controller',{
	extend: 'Ext.app.Controller',
	
	currentViewName: 0,
	currentView: null,
	
	views: 	['View@App.mainmenu'],
	
	init: function() {
		this.control({
            'mainmenu': {
                itemclick: this.swichModule,
            },
        });
        this.swithToHomeScreen();
	},
	swithToHomeScreen: function () {
		
		var view = Ext.getCmp('MAIN_VIEW');
		
		if (this.currentView) {
			this.currentView.destroy();
		}
		this.currentView = Ext.create('App.Homescreen');
		
		view.add(this.currentView);
	},
	swichModule: function( view, record, item, index, e, eOpts ) {
		var mod_name = record.data.module;
		
		if (mod_name && mod_name !== this.currentViewName)
		{			
			var view = Ext.getCmp('MAIN_VIEW');

			if (this.currentView) {
				this.currentView.destroy();
			}
			this.currentView = Ext.create('App.' + mod_name + '.View');
			this.currentViewName = mod_name;

			if (record.data.customCls) {
				this.currentView.addCls(record.data.customCls);
			}
			view.add(this.currentView);
		}
	},
	addMenuItem: function(config) {
		var menu = Ext.getCmp('MAIN_MENU');
        	menu = menu.getRootNode();
        	if (!config.glyphColor) {
	        	config.glyphColor = '333';
        	}
        	
            menu.appendChild({
            	text:config.name,
            	module:config.module,
            	glyph:config.glyph,
            	customCls:config.customCls,
            	leaf:true,
            	icon:'data:image/gif;base64,R0lGODlhAQABAIAAAP',
            	cls:'main_menu_item '+config.glyph+' text_before_'+config.glyphColor,
            });
	}
});