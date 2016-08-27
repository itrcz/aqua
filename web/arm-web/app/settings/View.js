Ext.define('App.settings.View', {
    extend: 'Ext.tab.Panel',
    id:"settings",

    title: 'Настройки',
	bodyStyle: "padding:10px",
	items:[
		{
			title:"Основные",
			items: [
				{
					xtype: "serviceslist",
					//title: "Службы",
					//columns: [
				    //   
				    //    { text: 'Название', dataIndex: 'username', flex: 3 },
				    //    { text: 'Статус', dataIndex: 'action', flex: 2 },
				    //    { text: '', dataIndex: 'ipaddr', flex: 1 }
				    //],
				}
			]
		},
		{
			title:"База данных"
		},
		{
			title:"SSL"
		}
	]
});
