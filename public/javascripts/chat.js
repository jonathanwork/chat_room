var Chat = function(socket) {
  this.socket = socket;
}
//send message
Chat.prototype.sendMessage = function(room, text) {
  var message = {
    room: room,
    text: text
  };
  this.socket.emit('message', message);
};
//change rooms
Chat.prototype.changeRoom = function(room) {
  this.socket.emit('join' , {
    newRoom: room
  });
};
Chat.prototype.processCommand = function(command) {
  var words = command.split(' ');
  var command = words[0].substring(1, words[0].length).toLowerCase();

  var message = false;

  switch (command) {
    case 'join':
      words.shift();
      var room = words.join(' ');
      this.changeRoom(room);
      break;
    case 'nickname':
      words.shift();
      var name = words.join(' ');
      this.socket.emit('nameAttempt', name);
      break;
    default:
      message = 'Unrecoginzed command.';
      break
  };
  return message;
};
