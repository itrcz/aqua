module.exports = function(ns) {
	ns.cpuAverage = function() {
		var cpus = os.cpus();
		
		var ret = {
			model:cpus[0].model,
			usage:0,
			cores:[]
		};
		
		for(var i = 0, len = cpus.length; i < len; i++) {
			
			var core = {}
			var cpu = cpus[i], total = 0;
			
			for(var type in cpu.times) {
				total += cpu.times[type];
			}
			
			for(type in cpu.times) {
				core[type] = Math.round(100 * cpu.times[type] / total);
			}
			ret.cores.push(core);
		}
		var totalUsage = 0;
		for(var i in ret.cores) {
			var usageCore = 100 - ret.cores[i].idle;
			totalUsage += usageCore;
		}
		ret.usage = 100*(totalUsage / (ret.cores.length*100));
		
		return ret;
	}
}