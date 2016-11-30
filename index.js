var express = require('express');
var app = express();
var server = require('http').createServer(app);
var mongoose = require('mongoose');

app.set('port', (process.env.PORT || 5000));

var io = require('socket.io').listen(app.listen(app.get('port'), function(){
	console.log('Server listening at port %d', app.get('port'));
}));

//Connect to the mongo database
mongoose.connect('mongodb://qsvr.quindar.space:27017/quindar');
//Load the model for SatData1
var satData1 = require('./public/model/satData1');

app.use('/public', express.static('public'));

app.get('/', function(request, response) {
	response.writeHead(301, {location: '/public/html/index.html'});
	response.end();
});

io.on('connection', function(socket){
	console.log('socket.io server connected.');

	socket.on('satData1', function(data){
		try {
		    var parsedData = JSON.parse(data);
		} catch (e) {
		    console.log("not JSON");
		}

		var newSatData1 = new satData1({
			timestamp : parsedData.timestamp, 
			vehicleId : parsedData.vehicleId, 
			vx: parsedData.vx, 
			vy: parsedData.vy, 
			vz: parsedData.vz, 
			x: parsedData.x, 
			y: parsedData.y,
			z: parsedData.z
		});

		newSatData1.save(function(err) {
		  if (err) throw err;

		  console.log('Data saved successfully!');
		});
	});

});