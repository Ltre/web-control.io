var Server = require('http').createServer();
var IO = require('socket.io')(Server);

IO.on('connection', function(socket){
	
	socket.join(-(-new Date()));
	//接口：主控端向被控端发送命令
	socket.on('fm/sendCMD', function(token, type, value){
		if (! token) return;
		console.log([token, type, value]);
		IO.emit('fm/acceptCMD', token, type, value);//暂未解决点对点问题，先用群发配合token来识别同一通道的客户端
	});
	
});

IO.listen('3000');