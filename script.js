const peer = new Peer(''+Math.floor(Math.random()*2**18).toString(36).padStart(4,0), {
	host: location.hostname,
	debug: 1,
	path: '/myapp'
});

window.peer = peer;

function getLocalStream() {
	navigator.mediaDevices.getUserMedia({video: false, audio: true}).then( stream => {
		window.localStream = stream;
		window.localAudio.srcObject = stream;
		window.localAudio.autoplay = stream;
	}).catch( err => {
		console.log('Aie, problemos: ' + err);
	})
}

getLocalStream();

peer.on('open', function() {
	window.caststatus.textContent = `Ton ID est : ${peer.id}`;
});

const audioContainer = document.querySelector('.call-container');

function showCallContent() {
	window.caststatus.textContent = `Ton ID est : ${peer.id}`;
	callBtn.hidden = false;
	audioContainer.hidden = true;
}

function showConnectedContent() {
	window.caststatus.textContent = `T'es connecté, gars.`;
	callBtn.hidden = true;
	audioContainer.hidden = false;
}

// create peer connection

let code;
function getStreamCode() {
	code = window.prompt('Entre le code de ton pote');
}

let conn;
function connectPeers() {
	conn = peer.connect(code);
}

peer.on('connection', function(connection) {
	conn = connection;
})

const callBtn = document.querySelector('.call-btn');
callBtn.addEventListener('click', function() {
	getStreamCode();
	connectPeers();
	const call = peer.call(code, window.localStream);
	
	call.on('stream', function(stream) {
		window.remoteAudio.srcObject = stream;
		window.remoteAudio.autoplay = true;
		window.peerStream = stream;
		showConnectedContent();
	})
});

// answering a call

peer.on('call', function(call) {
	const answerCall = confirm("Tu veux répondre ?");
	
	if(answerCall) {
		call.answer(window.localStream);
		showConnectedContent();
		call.on('stream', function(stream) {
			window.remoteAudio.srcObject = stream;
			 window.remoteAudio.autoplay = true;
			 window.peerStream = stream;
		});
	} else {
		console.log("Appel refusé");
	}
});

// hang up a call

const hangUpBtn = document.querySelector('.hangup-btn');
hangUpBtn.addEventListener('click', function() {
	conn.close();
	showCallContent();
});

conn.on('close', function() {
	showCallContent();
})















