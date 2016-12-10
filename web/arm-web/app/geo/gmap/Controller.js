Ext.define('App.geo.Controller', {
	extend: 'Ext.app.Controller',
	
	views: 	['App.geo.View'],
	
	requires: [
        'App.unitgrid.Store'
    ],
	
    
	init: function() {
		
		var MenuController = App.getApplication().getController('App.mainmenu.Controller');
		var controller = this;


		MenuController.addMenuItem({
			name:'Карта',
			glyph:'icon-location',
			glyphColor:'green',
			module:'geo',
		});
		
		this.control({
	        "#IDITEM": {
	            itemdblclick: this.Func
	        }
	    });


	},
	unitController: App.getApplication().getController('App.unitgrid.Controller'),
	
	//Z-Index для маркеров
	ZIndex:1,
	
	addMapMarker: function(view,record) {
	    
	    if (!record || !record.data) return;
	    
		var me = this;
		
	    var unit = record.data;
	    
	    var map = view.getMap();
	    
	    var position = {
		    lat:parseFloat(unit.lat),
		    lng:parseFloat(unit.lng)
		};
	   	
		var unitMarker = new google.maps.Marker({
		    position: position,
		    map: map,
		    icon: '/images/status/'+unit.hw_availability+'.png',
		    listeners:{
			    click: function(){
				    console.log(1);
			    }
		    }
		});
		
		unit.els = {};
		
		//Создаем элементы для hover слоя
		unit.els.infoWindow 		= document.createElement('div');
		unit.els.title 				= document.createElement('div');
		unit.els.owner 				= document.createElement('div');
		unit.els.hw_availability 	= document.createElement('div');
		
		unit.els.controls 			= document.createElement('div');
	
		//Добавляем стили
		unit.els.title.classList = "title";
		unit.els.owner.classList = "owner";
		
	
		
		unit.els.params = {};
		
		//Создаем таблицу динамических данных
		
		var unitFileds = [
			{name:"Качество воды",		id:"instant_water_quality"		},
			{name:"Уровень (текущий)",	id:"instant_water_level"		},
			{name:"Уровень (месяц)",	id:"dynamic_water_level"		},
			{name:"Текущий расход",		id:"instant_water_consumption"	},
			{name:"Суточный расход",	id:"day_water_consumption"		},		
		];
			
		var paramsTable = document.createElement('table');
			paramsTable.classList = "params";
			
		var tbdy = document.createElement('tbody');
		
		for (var i = 0; i < unitFileds.length; i++) {
		    var tr = document.createElement('tr');
		    
		    var unitDataName = document.createElement('td');
		    	unitDataName.appendChild(document.createTextNode(unitFileds[i].name));
		    
		    unit.els.params[unitFileds[i].id] = document.createElement('td');
			
		    	
			tr.appendChild(unitDataName);	
			tr.appendChild(unit.els.params[unitFileds[i].id]); 
		           
		    tbdy.appendChild(tr);
		}
		
		paramsTable.appendChild(tbdy);
		
		unit.els.infoWindow.classList = "unitMarker";
		
		//Соединяем элементы
		unit.els.infoWindow.appendChild(unit.els.title);
		unit.els.infoWindow.appendChild(unit.els.owner);
		unit.els.infoWindow.appendChild(unit.els.hw_availability);
		unit.els.infoWindow.appendChild(unit.els.controls);
		unit.els.infoWindow.appendChild(paramsTable);
		
		
		unit.els.controls.classList = "controls";
		
		var button_edit = document.createElement('span');
			button_edit.classList = "icon-pencil"
			button_edit.addEventListener("click",function(){
				me.unitController.editRecord(me, record);	
			});
		
		unit.els.controls.appendChild(button_edit);
		
		var button_more = document.createElement('span');
			button_more.classList = "icon-chart-bar"
			button_more.addEventListener("click",function(){
				//me.unitController.editRecord(me, record);	
			});
		
		unit.els.controls.appendChild(button_more);
			
			    
		unit.draw = function(){
			unit.els.title.innerHTML = unit.name;
			unit.els.owner.innerHTML = unit.owner + " <a href='#'>Подробнее...</a>";
			
			
			switch (unit.hw_availability) {
				case 0:
					unit.els.hw_availability.innerHTML = "доступен";
					unit.els.hw_availability.classList = "status online icon-ok-circled2";
					break;
				case 1:
					unit.els.hw_availability.innerHTML = "нет связи";
					unit.els.hw_availability.classList = "status offline icon-cancel-circled2";
					break;
				default:
					unit.els.hw_availability.innerHTML = "нет данных";
					unit.els.hw_availability.classList = "status";
					
			}
				
			
			unit.els.params.instant_water_quality.innerHTML	= unit.instant_water_quality +" %";
			
			unit.els.params.instant_water_level.innerHTML	= unit.instant_water_level +" м";
			unit.els.params.dynamic_water_level.innerHTML	= unit.dynamic_water_level +" м";
			
			unit.els.params.instant_water_consumption.innerHTML	= unit.instant_water_consumption +" м³/ч";	
			unit.els.params.day_water_consumption.innerHTML	= unit.day_water_consumption +" м³/ч";	
			
		};
		
		unit.draw();
		
		
		
		var infowindow =  new google.maps.InfoWindow({
			content: unit.els.infoWindow,
			position: position
		});
		
		
		unitMarker.addListener("click",function(){
			if (infowindow.anchor) {
				infowindow.close();				
			} else {
				infowindow.open(map, this);
				infowindow.setZIndex(++me.ZIndex);
			}
		});
		infowindow.content.addEventListener("click",function(){
			infowindow.setZIndex(++me.ZIndex);
		});
	
    },
    
	afterRender: function(view) {
		var self = this;
			
		socket.on("unit_update", function(units) {
		  	Ext.each(units,function(newValues) {
		  		Ext.each(self.units,function(unit){
			  		if (newValues.id == unit.id) {
				  		Ext.apply(unit,newValues);
				  		unit.draw();	
			  		}
		  		});
		  	});
		});
		//Загрука всех скважин
		var store = Ext.getStore("App.unitgrid.Store");
		
        store.load(function(records){
	        
	        var bound = new google.maps.LatLngBounds();
			
			$(records).each(function(i){
				var record = records[i];
				//добавляем координаты скважины для расчета центра на карте	
				bound.extend( new google.maps.LatLng(record.data.lat, record.data.lng) );
				
				self.addMapMarker(view,record);
			});
			
			//Выставляем центр на карте
			view.setCenter( bound.getCenter() );
        });
        
	}
	

});