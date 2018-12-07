'use strict';

const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(8080).sockets;
const path = require('path');
const express = require('express'),

app = express();
app.listen(3000)
app.use(express.static(path.join(__dirname, 'public')));

mongo.connect('mongodb://127.0.0.1/chat', function (err, db) {
  if (err) { throw err; }
  client.on('connection', function (socket) {
    const sendStatus = function (statusMsg) {
      socket.emit('status', statusMsg);
	};
	
	getAllMessages(db, socket);

    socket.on('input', function (data) {
      const name = data.name;
      const message = data.message;

      let whitespacePattern = /^\s*$/;

      if (whitespacePattern.test(name) ||
        whitespacePattern.test(message)) {
        sendStatus('Name and message is required');
      } else {
        db.collection('messages').insert({ name, message }, function () { 
          client.emit('output', [data]);
          sendStatus({
            message: 'Message sent',
            clear: true
          });
        });
      }
    });
  });
});

const getAllMessages = function (db, socket) {
  db.collection('messages').find().limit(100).sort({_id: 1}).toArray(function (err, res) {
	if (err) { throw err; }
	socket.emit('output', res);
  });
};
