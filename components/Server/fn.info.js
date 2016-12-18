module.exports = function(ns) {
	ns.info = function() {
		return {
			platform:os.platform(),
			release:os.release(),
			arch:os.arch(),
			memory:os.totalmem(),
			hostname:os.hostname()
		};
	}

}