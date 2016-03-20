/**
 * 参考资料：
 *      https://github.com/socketio/socket.io-emitter
 *      https://github.com/socketio/socket.io-redis
 *      http://socket.io/docs/rooms-and-namespaces/
 *      https://github.com/socketio/socket.io
 */
var Server = require('http').createServer();
var IO = require('socket.io')(Server);
var _ = require('underscore');

var ControlRooms = {};
var platforms = ['fm', 'ctrl'];

var func = {
    regCmd: function(socket, platform, token){
        var action = 'regCmd';
        if (! (platform in ControlRooms)) ControlRooms[platform] = {};
        if (token in ControlRooms[platform]) {
            ControlRooms[platform][token].push(socket);
        } else {
            ControlRooms[platform][token] = [socket];
        }
    },
    sendCmd: function(socket, platform, token, type, value){
		if (! token) return;
		_.each(ControlRooms[platform][token], function(e){
            var backCmd = platform + '/acceptCmd';
            if (socket != e) { //不发给自己
                e.emit(backCmd, token, type, value);
            }
		});
    },
    sendCmdToAll: function(platform, type, value){
        var backCmd = platform + '/acceptCmdToAll';
        IO.emit(backCmd, null, type, value);
    }
};

IO.on('connect', function(socket){
    for (var i in platforms) {
        for (var j in func) {
            ~ function(cmd, platform, action){
                socket.on(cmd, function(){
                    arguments = Array.prototype.concat.apply([socket,platform], arguments);
                    func[action].apply(this, arguments);
                });
            }(platforms[i]+'/'+j, platforms[i], j);
        }
    }
});

IO.listen('3000');