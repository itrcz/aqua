Ext.define('App.geo.map.Controller', {
	extend: 'Ext.app.Controller',
	views: 	['App.geo.map.View'],
	requires: ['App.unitgrid.Store'],
	init: function() {
		var controller = this;
	},

	units: [], // список объектов на карте

	unitController: App.getApplication().getController('App.unitgrid.Controller'),

	//Вызывается когда карта готова к работе, вызывается из map view
	mapReady: function(mapView) {
		var self = this;
		var map = mapView.map;
		/*
		socket.on("unit_update", function(units) {
			console.log(units);
			Ext.each(units,function(newValues) {
				Ext.each(self.units,function(unit){
					if (newValues.id == unit.id) {
						Ext.apply(unit,newValues);
						unit.draw();
					}
				});
			});
		});
		*/

		//Загрука всех скважин
		var store = Ext.getStore("App.unitgrid.Store");

		store.load(function(records) {
			var collection = new ymaps.GeoObjectCollection();

			$(records).each(function(i) {
				var unit = self.createUnit(records[i].data);

 				// Создание макета балуна на основе Twitter Bootstrap.
 				var layout = ymaps.templateLayoutFactory.createClass(unit.els.dom.innerHTML,
                    {
						/**
						* Строит экземпляр макета на основе шаблона и добавляет его в родительский HTML-элемент.
						* @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/layout.templateBased.Base.xml#build
						* @function
						* @name build
						*/
						build: function () {
							this.constructor.superclass.build.call(this);

							this._$element = $('.map-popup', this.getParentElement());


							var unit_id = "#unit_"+unit.data.id+"_";


							$(".map-popup__title", this._$element).html(unit.data.name);
							$(".map-popup__subtitle", this._$element).html(unit.data.owner);

							$(unit_id + "instant_water_quality").html(unit.data.instant_water_quality);
							$(unit_id + "instant_water_level").html(unit.data.instant_water_level);
							$(unit_id + "dynamic_water_level").html(unit.data.dynamic_water_level);
							$(unit_id + "instant_water_consumption").html(unit.data.instant_water_consumption);
							$(unit_id + "day_water_consumption").html(unit.data.day_water_consumption);

							this.applyElementOffset();

							this._$element.find('.map-popup__close').on('click', $.proxy(this.onCloseClick, this));

							var unit_id = "#unit_"+unit.data.id+"_";


							$(unit_id +"_edit").on("click",function(){
								var record = Ext.create("App.unitgrid.Model", unit.data);
								self.unitController.editRecord(self, record);
							});

						},
						/**
						* Удаляет содержимое макета из DOM.
						* @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/layout.templateBased.Base.xml#clear
						* @function
						* @name clear
						*/
						clear: function () {
							this._$element.find('.map-popup__close')
							.off('click');

							this.constructor.superclass.clear.call(this);
						},
						/**
						* Метод будет вызван системой шаблонов АПИ при изменении размеров вложенного макета.
						* @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IBalloonLayout.xml#event-userclose
						* @function
						* @name onSublayoutSizeChange
						*/
						onSublayoutSizeChange: function () {
							MyBalloonLayout.superclass.onSublayoutSizeChange.apply(this, arguments);

							if(!this._isElement(this._$element)) {
								return;
							}

							this.applyElementOffset();

							this.events.fire('shapechange');
						},
						/**
						* Сдвигаем балун, чтобы "хвостик" указывал на точку привязки.
						* @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IBalloonLayout.xml#event-userclose
						* @function
						* @name applyElementOffset
						*/
						applyElementOffset: function () {
							this._$element.css({
								left: -(this._$element[0].offsetWidth / 2),
								top: -(this._$element[0].offsetHeight) - 10
							});
						},

						/**
						* Закрывает балун при клике на крестик, кидая событие "userclose" на макете.
						* @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IBalloonLayout.xml#event-userclose
						* @function
						* @name onCloseClick
						*/
						onCloseClick: function (e) {
							e.preventDefault();

							this.events.fire('userclose');
						},


						/**
						* Используется для автопозиционирования (balloonAutoPan).
						* @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/ILayout.xml#getClientBounds
						* @function
						* @name getClientBounds
						* @returns {Number[][]} Координаты левого верхнего и правого нижнего углов шаблона относительно точки привязки.
						*/
						getShape: function () {
							if(!this._isElement(this._$element)) {
								return layout.superclass.getShape.call(this);
							}

							var position = this._$element.position();

							return new ymaps.shape.Rectangle(new ymaps.geometry.pixel.Rectangle([
								[position.left, position.top], [
								position.left + this._$element[0].offsetWidth,
								position.top + this._$element[0].offsetHeight - 10
								]
								]));
						},

						/**
						* Проверяем наличие элемента (в ИЕ и Опере его еще может не быть).
						* @function
						* @private
						* @name _isElement
						* @param {jQuery} [element] Элемент.
						* @returns {Boolean} Флаг наличия.
						*/
						_isElement: function (element) {
							return element && element[0];
						}
					//end of layout
				});
				// Создание вложенного макета содержимого балуна.
				var content = ymaps.templateLayoutFactory.createClass(
					'<h3 class="popover-title">$[properties.balloonHeader]</h3>' +
					'<div class="popover-content">$[properties.balloonContent]</div>'
					);
				// Создание метки с пользовательским макетом балуна.
				var marker = new ymaps.Placemark([unit.data.lat, unit.data.lng], {
					balloonHeader: 'Заголовок балуна',
					balloonContent: 'Контент балуна'
				}, {
					preset: unit.data.hw_availability ? "islands#blueWaterParkCircleIcon" : "islands#redWaterParkCircleIcon",
					balloonShadow: false,
					balloonLayout: layout,
					balloonContentLayout: content,
					//Не скрываем иконку при открытом балуне.
					hideIconOnBalloonOpen: false,
					// И дополнительно смещаем балун, для открытия над иконкой.
					// balloonOffset: [3, -40]
				});
				//Добавляем объект в коллекцию 
				collection.add(marker);
				//end of records.each
			});
			//Добавляем коллекцию на карту
			map.geoObjects.add( collection );	
			//Выставляем центр на карте
			map.setBounds( collection.getBounds() );
			
			//end of store.load
		});
		//end of mapReady
	},
	createUnit: function(data) {
		var unit = {
			data: data,
			els: {},
		};

		//Создаем таблицу динамических данных
		var unitFileds = [
		{ name:"Качество воды",     id: "instant_water_quality"     },
		{ name:"Уровень (текущий)", id: "instant_water_level"       },
		{ name:"Уровень (месяц)",   id: "dynamic_water_level"       },
		{ name:"Текущий расход",    id: "instant_water_consumption" },
		{ name:"Суточный расход",   id: "day_water_consumption"     },
		];


		//Создаем элементы для hover слоя
		unit.els.dom                = document.createElement('div');
		unit.els.popup              = document.createElement('div');
		unit.els.close              = document.createElement('a');
		unit.els.title              = document.createElement('div');
		unit.els.subtitle           = document.createElement('div');
		unit.els.hw_availability    = document.createElement('div');
		unit.els.controls           = document.createElement('div');
		unit.els.controls__edit     = document.createElement('span');
		unit.els.controls__more     = document.createElement('span');

		unit.els.params             = document.createElement('table');

		//Добавляем стили
		unit.els.popup.classList            = "map-popup";
		unit.els.close.classList            = "map-popup__close";
		unit.els.title.classList            = "map-popup__title";
		unit.els.subtitle.classList         = "map-popup__subtitle";
		unit.els.controls.classList         = "map-popup__controls";
		unit.els.params.classList           = "map-popup__params";
		unit.els.controls__edit.classList   = "map-popup__button icon-pencil";
		unit.els.controls__more.classList   = "map-popup__button icon-chart-bar";

		unit.els.controls__edit.id          = "unit_" + unit.data.id + "_edit";
		unit.els.controls__more.id          = "unit_" + unit.data.id + "_more";

		unit.els.close.innerHTML = "&times;";

		var tbody = document.createElement('tbody');
		for (var i = 0; i < unitFileds.length; i++) {
			var tr = document.createElement('tr');
			var td_title = document.createElement('td');
			td_title.appendChild(document.createTextNode(unitFileds[i].name));

			var td_value = document.createElement('td');
			td_value.id =  "unit_" + unit.data.id + "_" + unitFileds[i].id;

			tr.appendChild(td_title);
			tr.appendChild(td_value);
			tbody.appendChild(tr);
		}
		unit.els.params.appendChild(tbody);
		
		//Соединяем элементы
		unit.els.controls.appendChild(unit.els.controls__edit);
		unit.els.controls.appendChild(unit.els.controls__more);
		unit.els.popup.appendChild(unit.els.close);

		unit.els.popup.appendChild(unit.els.title);
		unit.els.popup.appendChild(unit.els.subtitle);
		unit.els.popup.appendChild(unit.els.hw_availability);
		unit.els.popup.appendChild(unit.els.controls);
		unit.els.popup.appendChild(unit.els.params);

		unit.els.dom.appendChild(unit.els.popup);

		unit.draw = function(){
			unit.els.title.innerHTML = unit.name;
			unit.els.subtitle.innerHTML = unit.owner + " <a href='#'>Подробнее...</a>";
			unit.els.hw_availability.innerHTML = "нет связи";
			unit.els.hw_availability.classList = "status offline icon-cancel-circled2";
			if (unit.hw_availability) {
				unit.els.hw_availability.innerHTML = "доступен";
				unit.els.hw_availability.classList = "status online icon-ok-circled2";
			}
			unit.els.params.instant_water_quality.innerHTML = unit.instant_water_quality +" %";
			unit.els.params.instant_water_level.innerHTML   = unit.instant_water_level +" м";
			unit.els.params.dynamic_water_level.innerHTML   = unit.dynamic_water_level +" м";
			unit.els.params.instant_water_consumption.innerHTML = unit.instant_water_consumption +" м³/ч";
			unit.els.params.day_water_consumption.innerHTML = unit.day_water_consumption +" м³/ч";
			unit.marker.properties.set({balloonContent:unit.els.dom.innerHTML});
		};
		return unit;
	},

});
