var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	path = require('path');
	usernames = [],
	emoji = require('node-emoji'),
	listEmoji = require('./emoji.json');

server.listen(process.env.PORT || 3000);

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname + '/index.html'));
});

io.sockets.on('connection', (socket) => {
	socket.on('new user', (data, callback) => {
		if(usernames.indexOf(data) != -1) {
			callback(false);
		}
		else {
			callback(true);
			socket.username = data;
			usernames.push(socket.username);
			updateUsernames();
			let listemoji = [];
			Object.keys(listEmoji).forEach( (key) => {
				listemoji.push(emoji.emojify(listEmoji[key]));
			});
			io.sockets.emit('new user', { listemoji: listemoji});
		}
	});

	function updateUsernames() {
		io.sockets.emit('usernames', usernames);
	}

	//send message
	socket.on('send message', (data) => {
		data = emoji.emojify(data);
		io.sockets.emit('new message', { msg : data, user : socket.username });
	});

	socket.on('disconnect', (data) => {
		if(!socket.username) return;
		usernames.splice(usernames.indexOf(socket.username), 1);
		updateUsernames();
	});
});
