/**
 * 参考资料：
 *      https://github.com/socketio/socket.io-emitter
 *      https://github.com/socketio/socket.io-redis
 *      http://socket.io/docs/rooms-and-namespaces/
 *      https://github.com/socketio/socket.io
 */
const fs = require('fs');
const https = require('https');
const socketIO = require('socket.io');

const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/io.miku.us/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/io.miku.us/fullchain.pem')
};

var Server = https.createServer(options);
var IO = socketIO(Server, {
    cors: {
        origin: function(origin, callback) {
          const allowedOrigins = ["https://miku.us", "https://fm.miku.us", "https://larele.com"];
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error("Not allowed by CORS"));
          }
        },
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ["my-custom-header"]
    }
});

var _ = require('underscore');

var ControlRooms = {};
var platforms = ['fm', 'ctrl', 'jgy'];//miku.us/fm/ctrlview/xxx、miku.us/ctrl/qr#sb、res.miku.us/#!m20&showControlView=xxx

var func = { // 声明结构： action => callback(socket, platform, ...){}
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
                //向客户端被控者发送：token-身份标识, type-动作类型, value-附加数据(可选)
                e.emit(backCmd, token, type, value);
            }
		});
    },
    sendCmdToAll: function(socket, platform, type, value){
        var backCmd = platform + '/acceptCmdToAll';
        IO.emit(backCmd, null, type, value);
    }
};

IO.on('connection', function(socket){
    for (var i in platforms) {
        for (var j in func) {
            ~ function(cmd, platform, action){
                socket.on(cmd, function(){ //接受客户端主控者传递的参数：具体结构根据platform来区别
                    var args = Array.prototype.concat.apply([socket,platform], arguments);
                    func[action].apply(this, args);
                });
            }(platforms[i]+'/'+j, platforms[i], j);
        }
    }
});

Server.listen('3000', () => {
    console.log('Server running on https 3000');
});