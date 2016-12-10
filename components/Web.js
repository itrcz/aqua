if (typeof(app) === "undefined") {
	global.printError("Error occured while starting WebServer, cannot start socket without Server component");
	return;
}
app.get('/', function (req, res) {
	 res.status(403).send('Hi stranger, I\'m a webserver, I wish to say that I have an error for you, with code 403 that means I cannot display this page to you cause you does not have proper permissions, sorry stranger!'); 
});	

//app.get('/management/', function (req, res) {
//	res.sendFile(process.env.PWD+'/web/arm-web/index.html');
//});		

app.use(express.static(__dirname+'/../web'));
				 