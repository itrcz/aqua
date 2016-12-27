Ext.define('App.reports.View', {
    extend: 'Ext.tab.Panel',
    
    //xtype: 'line-spline',

	height:200,
    width: 650,

	requires: [
        'App.reports.Store'
    ],	
    items: [{
			title:"Тест",
			items: [
				{
					xtype: 'chart',
		            width: '100%',
		            height: 500,
		            store: {
			            type: 'reports'
		            },
		            insetPadding: {
		                top: 40,
		                left: 20,
		                right: 40,
		                bottom: 20
		            },
		            sprites: [{
		                type: 'text',
		                text: 'Динамика тестовой скважине',
		                font: '22px Helvetica',
		                width: 100,
		                height: 30,
		                x: 40, // the sprite x position
		                y: 20  // the sprite y position
		            }],
		            axes: [{
		                type: 'numeric',
		                position: 'left',
		                title: 'Динамика',
		                grid: true,
		                fields: 'lvl',
		                label: {
		                    renderer: function(v) {
		                        return Ext.util.Format.number(v, '0.00');
		                    }
		                },
		                minimum: 0
		               
		            }, {//"2016-07-05T15:16:29.000Z"
		                type: 'category',
		                position: 'bottom',
		                title: 'Время',
		               // dateFormat: 'h:m',
		                grid: true,
		                fields: 'recordDate',
		                label: {
		                    rotate: {
		                      //  degrees: -45
		                    }
		                }
		            }],
		            
		            series: [{
		                type: 'line',
		                axis: 'left',
		                xField: 'recordDate',
		                yField: 'lvl',
		                smooth: false,
		                highlight: false,
		                showMarkers: false,
		                style: {
		                    lineWidth: 0,
		                    opacity:0.4,
		                    color:"#157fcc"
		                },
		                marker: {
		                    radius: 2
		                },
		                tooltip: {
		                    trackMouse: true,
		                    style: 'background: #fff',
		                    renderer: function(tooltip, store) {
		                        tooltip.setHtml(store.get("lvl") );
		                    }
		                },highlight: {
		                    fillStyle: '#000',
		                    radius: 5,
		                    lineWidth: 2,
		                    strokeStyle: '#157fcc'
		                },

		           }]
		        }
			]
	}]
});
