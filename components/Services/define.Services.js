module.exports = function(ns) {
	app.socket.defineClass("Services", {
		restart: {
			params: ['service'],
			$: function(req,_callback) {
				
				if (req.data.service) {
					
					return ns.restart({
						user: req.user,
						service: req.data.service
					},_callback);
				}
				return _callback(false);
			}
		},

		read: {
			params: ['page', 'start', 'limit'],
			$: function(req,_callback) {
				return ns.getStats(false,_callback);
			},
		}
	});
}