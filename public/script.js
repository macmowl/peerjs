const socket = io('/');
const videoGrid = document.getElementById('video-grid');
const videoMain = document.getElementById('video-main');
const peer = new Peer(undefined, {
	host: '/',
	port: 8001,
});
const video = document.createElement('video');
video.muted = true;
const peers = {};
let i = 1;
navigator.mediaDevices.getUserMedia({
	video: true,
	audio: true,
}).then(stream => {
	addVideoStream(video, stream);
	peer.on('call', call => {
		call.answer(stream);
		const video = document.createElement('video');
		video.setAttribute('id', i);
		i++;
		call.on('stream', userVideoStream => {
			addVideoStream(video, userVideoStream);
		})
	})
	socket.on('user-connected', userId => {
		connectToNewUser(userId, stream);
	})
})

socket.on('user-disconnected', userId => {
	if (peers[userId]) peers[userId].close();
})

peer.on('open', id => {
	socket.emit('join-room', ROOM_ID, id);
});


socket.on('user-connected', userId => {
	console.log('User connected: ' + userId);
})

function addVideoStream(video, stream) {
	video.srcObject = stream;
	video.addEventListener('loadedmetadata', () => {
		video.play();
	})
	if (i == 1) {
		video.setAttribute('id', 'main');
		videoMain.append(video);
	} else {
		videoGrid.append(video);
	}
	
}

function connectToNewUser(userId, stream) {
	const call = peer.call(userId, stream);
	const video = document.createElement('video');
	video.setAttribute('id', i);
	i++;
	call.on('stream', userVideoStream => {
		addVideoStream(video, userVideoStream);
	});
	call.on('close', () => {
		video.remove();
	});
	
	peers[userId] = call
}