Ext.define('Plugins.Debug', {
	
	enable:false,
	
    init: function(arg) {
	    
	    var self = this;
	    
	    if (arg && arg.enable) {
		    
		    this.enable = arg.enable;
		    
	    }
	    
	    window.printDebug = function(string) {
		    
		    if (string && self.enable && window.console && console.log) {
			    
			    console.log(string);
			    
		    }
		    
		    return self.enable;
	    }
    }
});