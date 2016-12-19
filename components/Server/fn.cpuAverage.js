module.exports = function(ns) {
	ns.cpuAverage = function() {
		let cpus = os.cpus();
		
		let ret = {
			model:cpus[0].model,
			usage:0,
			cores:[]
		};
		
		for(let i = 0, len = cpus.length; i < len; i++) {
			
			let core = {}
			let cpu = cpus[i], total = 0;
			
			for(let type in cpu.times) {
				total += cpu.times[type];
			}
			
			for(type in cpu.times) {
				core[type] = Math.round(100 * cpu.times[type] / total);
			}
			ret.cores.push(core);
		}
		
		let totalUsage = 0;
		for(let i in ret.cores) {
			let usageCore = 100 - ret.cores[i].idle;
			totalUsage += usageCore;
		}
		ret.usage = 100*(totalUsage / (ret.cores.length*100));
		
		return ret;
	}
}