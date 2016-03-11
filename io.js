//加入clientId，防止广告广播作用到发出者

var Server = require('http').createServer();
var IO = require('socket.io')(Server);
var _ = require('underscore');

var ControlRooms = {};

var func = {
    regCmd: function(platform, clientId, token){
        if (! platform in ControlRooms) ControlRooms[platform] = {};}
        if (! action in ControlRooms[platform]) ControlRooms[platform][action] = {};
        if (! token in ControlRooms[platform][action]) {
            ControlRooms[platform][action] = [socket];
        } else {
            ControlRooms[platform][action].push(socket);
        }   
    },
    sendCmd: function(platform, clientId, token, type, value){
		if (! token) return;
		_.each(ControlRooms[token], function(e){
            var backCmd = platform + '/' + arguments.callee.name;
            e.emit(backCmd, token, type, value);
		});
    },
    sendCmdToAll: function(platform, clientId, type, value){
        var backCmd = platform + '/' + arguments.callee.name;
        IO.emit(backCmd, null, type, value);
    }
};


IO.on('connect', function(socket){
    socket.on(cmd, function(token){
        cmd = cmd.split('/');
        var platform = cmd[0];
        var action = cmd[1];
        arguments.unshift(socked.id);//这里是伪代码，获取clientID
        arguments.unshift(platform);
        func[action].apply(this, arguments);
    });
});