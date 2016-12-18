module.exports = function(ns) {
	app.socket.defineClass("CommLog", {
		read: {
			params: ['page', 'start', 'limit'],
			$: function(req,_callback) {
				return ns.getCommunicationLog(false,_callback);
			},
		}
	});
}