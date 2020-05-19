var socket = io();
var ready = false;
var localPos = [];
var localVote = 0;
var ad = false;

//add updatecode to prog

function upDateUserList(users, pos, votepr){
	localPos= pos;
	localVote = votepr;
	if (ready) {
		console.log(votepr);
		if(votepr != 0){
			if(ad) {
				var co = 0;
				for(i = 0; i < users.length; i++) {
					if(users[i][3]==pos[localVote-1][1].length+2){
						co += 1;
					}
					document.getElementById("abs").innerHTML = "There are/is " + co + " people/person who hasn't voted yet, out of " + users.length +" total people."
				}

			}
			document.getElementById("votingBox").style.display = "block";
			document.getElementById("votingBox").innerHTML = "Vote For:<br>";
			document.getElementById("currentV").innerHTML = "Currently Voting For Position of " + pos[votepr-1][0];
			document.getElementById("votingBox").innerHTML += "<button class='inl' onclick=\"voteFor(0)\" >Abstain</button>";
			document.getElementById("votingBox").innerHTML += "<button class='inl' onclick=\"voteFor(1)\" >No Vote</button>";
		}
		var userLu = "";
		for (i = 0; i < users.length; i++) {
			userLu += "<li>" + users[i][1] + "</li>";
		}
		document.getElementById("Ausers").innerHTML = userLu;
		var postr = "<tr><th>Positions</th><th>Candidates</th><tr>";
		for (i = 0; i < pos.length; i++) {
			
			postr += "<tr><th onclick='newRunner("+i+")'>" + pos[i][0] + "</th><th class='noMar'><table id='tb"+i+"'><tr><th>abstained</th><th>No Vote</th>";
			for (j = 0; j < pos[i][1].length; j++) {
				postr += "<th onclick='delRunner("+i+","+j+")'>" + pos[i][1][j] + "</th>";
				if(votepr != 0){
					if(i==votepr-1){
						var fjfj = j+2;
						document.getElementById("votingBox").innerHTML += "<button class='inl' onclick=\"voteFor("+fjfj+")\" >" + pos[i][1][j] + "</button>";
					}
				}
			}
			postr += "</tr></table></th></tr>";	

		}
		document.getElementById("posSel").innerHTML = postr;

		if(ad){
			for (i = 0; i < pos.length; i++) {
			
				if (pos[i][2].length >= 1) {
					console.log(pos[i]);
					var ress = "<tr>";
					for (b = 0; b < pos[i][2].length; b++){
						ress += "<th>" + pos[i][2][b] + "</th>";
					}
					ress += "</tr>";
					console.log(document.getElementById("tb"+i).innerHTML);

					document.getElementById("tb"+i).innerHTML += ress;
				}
			} 
		}
		
		document.getElementById("votingBox").innerHTML += "<br>You are currently voting for ";
		for (i = 0; i < users.length; i++) {
			if(users[i][0]==socket.id){
				if(users[i][3] == 0) {
					document.getElementById("votingBox").innerHTML += "abstaine.";
				} else if(users[i][3]==1){
					document.getElementById("votingBox").innerHTML += "no vote.";
				} else if(users[i][3] == pos[localVote-1][1].length+2){
					document.getElementById("votingBox").innerHTML += "abstaine.";
				} else{
					document.getElementById("votingBox").innerHTML += localPos[localVote-1][1][users[i][3]-2];
				}	
			}
		}
	}
}

function addButton(parentId, fun, html, idd) {
	// Adds an element to the document
	var p = document.getElementById(parentId);
	var newElement = document.createElement("button");
	newElement.setAttribute('onclick', fun);
	newElement.setAttribute('class', "admin");
	newElement.innerHTML = html;
	p.appendChild(newElement);
}

$('#name').submit(function(e){
	e.preventDefault(); // prevents page reloading
	if ($('#m').val() == "") {
    alert("Name must be filled out");
    return false;
  } else {
		socket.emit('Username', $('#m').val());
		$('#m').val('');

		return false;
	}	
});

$('#passEnt').submit(function(e){
	e.preventDefault(); // prevents page reloading
	
	socket.emit('newAdmin', $('#q').val());
	$('#q').val('');

	return false;
});

function nextPos(){
	if(confirm("Are you sure you are ready to vote for the "+localPos[localVote][0])){
		if(ad){
			socket.emit("prog");
		}
	}
	
}

function voteFor(an){
	if(an == 0) {
		if (confirm("Are you sure you want to abstaine")) {
			socket.emit("voteFor", an);
		}
	} else if(an==1){
		if (confirm("Are you sure you want to vote for No Vote")) {
			socket.emit("voteFor", an);
		}
	} else {
		if (confirm("Are you sure you want to vote for "+ localPos[localVote-1][1][an-2])) {
			socket.emit("voteFor", an);
		}
	}
	
}

function countVote(){
	if(localVote!=0){
		if(ad){
			socket.emit("countVote");
		}	
	}
	
}

function newRunner(whichPos){
	if(ad){
		if(whichPos>= localVote) {
			var neCan = prompt("Enter the new runner for" + localPos[whichPos][0]);
			if (neCan != null) {
				socket.emit("newRunner", neCan, whichPos);
			}
		}
	}
}

function delRunner(i,j){
	if(ad){
		if(i>= localVote) {
			if (confirm("Are you sure you to remove "+localPos[i][1][j]+" from "+localPos[i][0])) {
				socket.emit("delRunner", i,j);
			}
		}
		
	}
}

socket.on('ready', function(users, pos, votepr){
	ready = true;
	element = document.getElementById("name");
	element.parentNode.removeChild(element);
	document.getElementById("passEnt").style.visibility= "visible";
	document.getElementById("cuR").style.display = "block";
	upDateUserList(users, pos, votepr);
	document.getElementById("currentV").innerHTML = "Voting Has Not Begun Yet";
});

socket.on('resuts', function(voters){
	if (ad){
		document.getElementById("lastEV").innerHTML = "list of voters in the last election: " + voters;
	}
	
});

socket.on('youAda', function(madeIt){
	if(madeIt) {
		ad = true;
		document.getElementById("passEnt").style.visibility= "hidden";
		document.getElementById("buttons").style.visibility= "visible";
		document.getElementById("adminMay").style.display = "block";
		document.getElementById("adminMay").innerHTML = "You Are An Admin";
		
		addButton("buttons","nextPos()","Start or Progress Voting","nextPos");
		addButton("buttons","countVote()","Show Results and Voters","countVote");
		
	}
	else{
		document.getElementById("adminMay").innerHTML = "Admin Passward Incerect";
	}
});

socket.on('changeUserList', function(users, pos, votepr){
	upDateUserList(users, pos, votepr);
});

