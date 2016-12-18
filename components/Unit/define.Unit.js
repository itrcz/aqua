module.exports = function(ns) {
	app.socket.defineClass("Unit", {
		readChart: {
			params: ['page', 'start', 'limit'],
			$: function(req,_callback) {
				return ns.readChart(req.data,_callback);
			},
		},
		create: {
			params: ns.vars.fields,
			$: function(req,_callback) {
				return ns.addUnit(req.data,_callback);
			},
		},
		read: {
			params: ['page', 'start', 'limit'],
			$: function(req,_callback) {
				return ns.getUnits(req.data,_callback);
			},
		},
		update: {
			params: ns.vars.fields,
			$: function(req,_callback) {
				return ns.updateUnit(req.data,_callback);
			},
		},
		destroy: {
			params: ['id'],
			$: function(req,_callback) {
				return ns.removeUnit(req.data,_callback);
			},
		}
	});
}