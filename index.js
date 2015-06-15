var Server = require('http').createServer();
var IO = require('socket.io')(Server);
var _ = require('underscore');

var ControlRooms = {/* token : [socket1,socket2] */};

IO.on('connect', function(socket){

	//注册控制间
	socket.on('fm/regCmd', function(token){
		if (undefined === ControlRooms[token]) {
			ControlRooms[token] = [socket];
		} else {
			ControlRooms[token].push(socket);
		}
	});

	//接口：主控端向被控端发送命令
	socket.on('fm/sendCmd', function(token, type, value){
		if (! token) return;
		_.each(ControlRooms[token], function(e){
			e.emit('fm/acceptCmd', token, type, value);
		});
	});

	//控制所有被控端的行为（不依赖ControlRooms）
	socket.on('fm/sendCmdToAll', function(type, value){
		IO.emit('fm/acceptCmd', token, type, value);
	});
	
});

IO.listen('3000');