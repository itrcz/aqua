module.exports = function(ns) {
	app.socket.defineClass("Log", {
		read: {
			params: ['page', 'start', 'limit'],
			$: function(req,_callback) {
				return ns.getLog(false,_callback);
			},
		}
	});
}