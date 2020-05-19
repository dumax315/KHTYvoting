var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var users = [];

var adminPas = "_";

var votingProg = 0; 

var posisitons = [["President",[],[]], ["Programming VP (PVP)", [],[]], ["Social Action VP (SAVP)",[],[]],["Religious and Cultural VP (RCVP)",[],[]] , ["Membership VP (MVP)",[],[]], ["Communication VP (CVP)",[],[]],[ "Finance VP (FVP)",[],[]]];

var currentVotes = [];

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
app.get('/main.js', function(req, res){
  res.sendFile(__dirname + '/main.js');
});
app.get('/style.css', function(req, res){
  res.sendFile(__dirname + '/style.css');
});

function arrayRemove(value) { 

	for (i = 0; i < users.length; i++) {
		if (users[i][0]==value){	
			users.splice(i,1);
		}
	}
}

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');

		arrayRemove(socket.id);
		io.emit('changeUserList', users, posisitons, votingProg)
  });

	socket.on('Username', function(username){
		users.push([socket.id,username,false,0])
		io.to(socket.id).emit('ready', users, posisitons,votingProg);
		console.log(users,posisitons);
		io.emit('changeUserList', users, posisitons, votingProg);
  });

	socket.on('newRunner', function(neCan, whichPos){
		posisitons[whichPos][1].push(neCan);
		io.emit('changeUserList', users, posisitons, votingProg);
  });

	socket.on('delRunner', function(i, j){
		posisitons[i][1].splice(j,1);
		io.emit('changeUserList', users, posisitons, votingProg);
  });

	socket.on('prog', function(){
		if (votingProg <= 8){
			if(votingProg != 0){
				countVote();
			}
			for(i = 0; i < users.length; i++) {
				users[i][3] = posisitons[votingProg][1].length+2;
			}
			votingProg += 1;
			io.emit('changeUserList', users, posisitons, votingProg);
		}
  });

	socket.on('voteFor', function(an){
		for (i = 0; i < users.length; i++) {
			if (users[i][0]==socket.id){	
				users[i][3] = an;
			}
		}
		io.emit('changeUserList', users, posisitons, votingProg);
  });
	
	socket.on('countVote', function(){
		countVote();
  });

	function countVote(){
		if(posisitons[votingProg-1][2].length == 0){
			posisitons[votingProg-1][2]= [0,0];
			var voters = [];
			for (i = 0; i < posisitons[votingProg-1][1].length; i++) {
				posisitons[votingProg-1][2].push(0);
			}
			for (i = 0; i < users.length; i++) {
				if (users[i][3] != posisitons[votingProg-1][1].length+2){
					voters.push(users[i][1]);
					posisitons[votingProg-1][2][users[i][3]] += 1;
				}	else {
					posisitons[votingProg-1][2][0] += 1;
				}
			}
			io.emit("resuts", voters);
			io.emit('changeUserList', users, posisitons, votingProg);
			posisitons[votingProg-1][2];
		}
  }

	socket.on('newAdmin', function(pass){
		if(adminPas == "_") {
			adminPas = pass;
			io.to(socket.id).emit('youAda', true)
			for (i = 0; i < users.length; i++) {
				if (users[i][0]==socket.id){	
					users[i][2] = true; 
				}
			}
		}
		else if(adminPas == pass) {
			io.to(socket.id).emit('youAda', true)
			for (i = 0; i < users.length; i++) {
				if (users[i][0]==socket.id){	
					users[i][2] = true; 
				}
			}
		}
		else{
			io.to(socket.id).emit('youAda', false)
		}
  });

});

http.listen(3000, () => {
  console.log('listening on *:3000');
});