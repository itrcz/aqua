
Ext.define('App.Viewport', {
	extend: 'Ext.container.Viewport',
	layout: 'border',
	height: 500,
	items: [{
		region:'west',
		layout: 'fit',
		bodyPadding:'0 0 0 0',
		split:true,
		border:false,
		items: [Ext.create('App.mainmenu.View')],
		width:200,
		minWidth: 200,
	},{
		region:'center',
		layout: 'fit',
		items: [{
			id:"MAIN_VIEW",
			xtype: 'panel',
			layout: 'fit',
			alias:'widget.mainview',
			border:false,
		}],
	},{
		region: 'south',
		border:0,
		items:{
			layout: {
				type: 'hbox',
				pack: 'start',
				align: 'stretch'
			},
			defaults:{
				border:0,
				frame:0,
			},
			items: [
			{html:'', flex:1,bodyStyle:"background:#157fcc"},
			{html:boot.software.name + " версия: " + boot.software.version + " сборка: " + boot.software.build, width:250,
			bodyStyle:'background:#157fcc;color:#fff;font-size:11px;font-weight:bold;text-align: right;padding-right:10px'}
			],
			border:0,
		}
	}]
});
