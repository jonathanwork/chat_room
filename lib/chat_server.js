

  var socketio = require('socket.io');
  var io;
  var guestNum = 1;
  var nickNames = {};
  var namesUsed = [];
  var currentRoom = {};
//socketio server
exports.listen = function(server) {
  io = socketio.listen(server);
  io.set('log level', 1);
  io.sockets.on('connection', function(socket) {
    guestNum = assignGuestName(socket, guestNum, nickNames, namesUsed);
    joinRoom(socket, 'Lobby');
    handleMessageBroadcasting(socket, nickNames);
    handleNameChangeAttempts(socket, nickNames, namesUsed);
    handleRoomJoining(socket);
    socket.on('rooms', function() {
      socket.emit('rooms', io.sockets.manager.rooms);
    });
    handleClientDisconnection(socket, nickNames, namesUsed);
  });
};

//assignGuestName
function assignGuestName(socket, guestNum,nickNames, namesUsed) {
  var name = 'Guest' + guestNum;
  nickNames[socket.id] = name;
  socket.emit('nameResult', {
    success: true,
    name: name
  });
  namesUsed.push(name);
  return guestNum + 1;
}
//Logic related to joining a room
function joinRoom(socket, room) {
  socket.join(room);
  currentRoom[socket.id] = room;
  socket.emit('joinResult', {room: room});
  socket.broadcast.to(room).emit('message', {
    text: nickNames[socket.id] + ' has joined ' + room + ' . '
  });

  var usersInRoom = io.sockets.clients(room);
  //if other user exists.
  if(usersInRoom.length > 1) {
    var usersInRoomSummary = 'users currenly in ' + room + ": ";
    for(var index in usersInRoom) {
      var userSocketId = usersInRoom[index].id;
      if(userSocketId != socket.id) {
        if(index > 0) {
          usersInRoomSummary += ', ';
        }
        usersInRoomSummary += nickNames[userSocketId];
      }
    }
    usersInRoomSummary += ' . ';
    socket.emit('message', {text: usersInRoomSummary});
  }
}


function handleNameChangeAttempts(socket, nickNames, namesUsed) {
  socket.on('nameAttempt' , function(name) {
    if(name.indexOf('Guest') == 0) {
      socket.emit('nameResult', {
        success: false,
        message: 'Nmae cannot begin with "Guest".'
      });
    } else {
      if(namesUsed.indexOf(name) == -1) {
        var previousName = nickNames[socket.id];
        var previousNameIndex = namesUsed.indexOf(previousName);
        namesUsed.push(name);
        delete namesUsed[previousNameIndex]; //removes names when the leave.
        socket.emit('nameResult', {
          success: true,
          name: name
        });
        socket.broadcast.to(currentRoom[socket.id]).emit('message', {
          text: previousName + " is now know as " + name + ' . '
        });
      } else {
        socket.emit('nameResult' , {
          success: false,
          message: "That name is already in use"
        })
      }
    }
  });
}

//sending chat messages.
function handleMessageBroadcasting(socket) {
  socket.on('message', function(message) {
    socket.broadcast.to(message.room).emit('message', {
      text: nickNames[socket.id] + ': ' +  message.text
    });
  });
}
//creating rooms
function handleRoomJoining(socket) {
  socket.on('join', function(room) {
    socket.leave(currentRoom[socket.id]);
    joinRoom(socket, room.newRoom)
  })
}

//handling user diconnections
function handleClientDisconnection(socket) {
  socket.on('disconnect', function() {
    var nameIndex = namesUsed.indexOf(nickNames[socket.id]);
    delete namesUsed[nameIndex];
    delete nickNames[socket.id];
  })
}
