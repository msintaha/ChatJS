'use strict';

(function () {
  let chatname = document.querySelector('.chat-name'),
    textarea = document.querySelector('.chat-textarea'),
    statusNode = document.querySelector('.chat-status span'),
    statusDefault = statusNode.innerHTML,
    chatMessages = document.querySelector('.chat-messages');

  let setStatus = function (s) {
    statusNode.textContent = s;

    if (s !== statusDefault) {
      setTimeout(function () {
        setStatus(statusDefault);
      }, 4000);
    }
  };

  setStatus('Initializing...');

  try {
    let socket = io.connect('http://127.0.0.1:8080');

    if (socket) {
      //Listen for Output
      socket.on('output', function (data) {
        if (data.length) {
          for (let x = 0; x < data.length; x++) {
            const message = document.createElement('div');
            message.setAttribute('class', 'chat-message');
            const user = data[x].name.bold();
            message.innerHTML = user + ' : ' + data[x].message;

            chatMessages.appendChild(message);
            chatMessages.insertBefore(message, chatMessages.firstChild);
          }
        }
      });

      //Listen for a status
      socket.on('status', function (data) {
        setStatus((typeof data === 'object') ? data.message : data);
        if (data.clear) {
          textarea.value = '';
        }
      });

      //Listen for keydown
      textarea.addEventListener('keydown', function (event) {
        setStatus('Typing...');
        const name = chatname.value;
        if (event.which === 13 && event.shiftKey === false) {
          socket.emit('input', {
            name: name,
            message: this.value
          });
          event.preventDefault();
        }
      });
    }
  } catch (err) {
    console.log('Not connected!', err);
  }
})();