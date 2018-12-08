const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(8080).sockets;
const path = require('path');
const express = require('express');

const app = express();

app.listen(3000);
app.use(express.static(path.join(__dirname, 'public')));

const getAllMessages = (db, socket) => {
  db.collection('messages').find().limit(100).sort({ _id: 1 })
    .toArray((err, res) => {
      if (err) { throw err; }
      socket.emit('output', res);
    });
};

mongo.connect('mongodb://127.0.0.1/chat', (err, db) => {
  if (err) { throw err; }
  client.on('connection', (socket) => {
    const sendStatus = (statusMsg) => {
      socket.emit('status', statusMsg);
    };

    getAllMessages(db, socket);

    socket.on('input', (data) => {
      const { name, message } = data;
      const whitespacePattern = /^\s*$/;

      if (whitespacePattern.test(name) || whitespacePattern.test(message)) {
        sendStatus('Name and message is required');
      } else {
        db.collection('messages').insert({ name, message }, () => {
          client.emit('output', [data]);
          sendStatus({
            message: 'Message sent',
            clear: true,
          });
        });
      }
    });
  });
});
