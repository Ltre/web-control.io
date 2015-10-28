var Server = require('http').createServer();
var IO = require('socket.io')(Server);
var _ = require('underscore');

var FMControlRooms = {/* token : [socket1,socket2] */};
var CtrlControlRooms = {/* token : [socket1,socket2] */};

IO.on('connect', function(socket){

	//FM注册控制间
	socket.on('fm/regCmd', function(token){
		if (undefined === FMControlRooms[token]) {
			FMControlRooms[token] = [socket];
		} else {
			FMControlRooms[token].push(socket);
		}
	});

	//FM接口：主控端向被控端发送命令
	socket.on('fm/sendCmd', function(token, type, value){
		if (! token) return;
		_.each(FMControlRooms[token], function(e){
			e.emit('fm/acceptCmd', token, type, value);
		});
	});

	//FM控制所有被控端的行为（不依赖ControlRooms）
	socket.on('fm/sendCmdToAll', function(type, value){
		IO.emit('fm/acceptCmd', null, type, value);
	});




	//CTRL注册控制间
	socket.on('ctrl/regCmd', function(token){
		if (undefined === CtrlControlRooms[token]) {
			CtrlControlRooms[token] = [socket];
		} else {
			CtrlControlRooms[token].push(socket);
		}
	});

	//CTRL接口：主控端向被控端发送命令
	socket.on('ctrl/sendCmd', function(token, type, value){
		if (! token) return;
		_.each(CtrlControlRooms[token], function(e){
			e.emit('ctrl/acceptCmd', token, type, value);
		});
	});

	//CTRL控制所有被控端的行为（不依赖ControlRooms）
	socket.on('ctrl/sendCmdToAll', function(type, value){
		IO.emit('ctrl/acceptCmd', null, type, value);
	});
	
});

IO.listen('3000');