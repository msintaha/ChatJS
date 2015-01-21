var mongo = require("mongodb").MongoClient; //requires the mongodb package in the node-modules folder
var client = require('socket.io').listen(8080).sockets; //requires the socket package in the node-modules folder

mongo.connect('mongodb://127.0.0.1/chat', function(err, db){
	if(err) throw err;
	
	client.on('connection', function(socket){ //when connection is on
		
		var col = db.collection('messages'),
		 	sendStatus = function(statusMsg){
				socket.emit('status', statusMsg);
			};
		
	
		//Display all the messages from Mongo DB
		col.find().limit(100).sort({_id: 1}).toArray(function(err, res){
		
			if(err) throw err;
			socket.emit('output', res);
		});
		
		//Wait for input
		socket.on('input', function(data){ //push the msg and name into nodejs server
			var name = data.name; //saves name from input
			var message = data.message; //saves msg from input
			//Regular Expression to identify the whitespace
		
			var whitespacePattern = /^\s*$/;
			
			if(whitespacePattern.test(name) || 
					whitespacePattern.test(message)){
					console.log("not inserted");
					sendStatus('Name and message is required');
			}else{
			col.insert({name:name, message:message}, function(){ //inserting into mongodb
				//Emit latest messages to all clients
				client.emit('output', [data]);
				
				sendStatus({
					message: "Message sent",
					clear:true
				});
			});	
			}
		});
	});

});