const userName = "Nabeel-" + Math.floor(Math.random() * 100000);
const password = "x";
document.querySelector("#user-name").innerHTML = userName;
const socket = io.connect("https://localhost:8181/", {
  auth: {
    userName,
    password,
  },
});
// populating the video feed for our local stream
const localVideoEl = document.querySelector("#local-video");
const remoteVideoEl = document.querySelector("#remote-video");

let localStream; //a var to hold the local video stream
let remoteStream; //a var to hold the remote video stream
let peerConnection; // the peerConnection that the two clients use to talk
let didIOffer = false;

// for the stun server through which we can get ice candidates
let peerConfiguration = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"],
    },
  ],
};
// so we are gonna send this configuration to our rtc peer connection

// when a client initiates a call
const call = async (e) => {
  await fetchUserMedia();
  //   now our createPeerConnection job is to set up peerConnection
  //   peerConnection is all set with our stun servers sent over
  await createPeerConnection();

  //   create OFFER time
  //   its not necessary to pass option here but you can pass
  try {
    console.log("Creating offer......");
    const offer = await peerConnection.createOffer();
    // After creating the offer, we now set it as the local description using await peerConnection.setLocalDescription(offer). This is crucial for the SDP negotiation process.
    // await peerConnection.setLocalDescription(offer);
    peerConnection.setLocalDescription(offer);
    console.log(offer);
    didIOffer = true;
    socket.emit("newOffer", offer); //send offer to signalling server
  } catch (error) {
    console.log(error);
  }
};
const answerOffer = async (offerObj) => {
  await fetchUserMedia();
  await createPeerConnection(offerObj);
  const answer = await peerConnection.createAnswer({}); //passed empty object here just to make the docs happy.
  await peerConnection.setLocalDescription(answer); // this is client 2 and client 2 uses the answer as the local description
  console.log(offerObj);
  console.log(answer);
  // console.log(peerConnection.signalingState); //should be have local pranswer because CLIENT2 has set its local description to its answer (but it won't be)
};

const fetchUserMedia = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localVideoEl.srcObject = stream;
      localStream = stream;
      resolve();
    } catch (error) {
      console.log(error);
      reject();
    }
  });
};

const createPeerConnection = (offerObj) => {
  return new Promise(async (resolve, reject) => {
    // RTCPeerConnection is the thing that creates the connection
    // we can pass a config object, and that config object can contain stun servers
    // which will fetch us ICE candidates
    // so this returns a promise so we will put await in there. and make our promise async
    peerConnection = await new RTCPeerConnection(peerConfiguration);
    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });

    peerConnection.addEventListener("signalingstatechange", (event) => {
      console.log(event);
      console.log(peerConnection.signalingState);
    });

    peerConnection.addEventListener("icecandidate", (e) => {
      console.log("...............ICE candidate found!.................");
      console.log(e);
      //   now we're eventually goint to send this ice candidate up to the other browser
      //   that's what the signaling part is
      // Here you would send this candidate to the remote peer
      // sendIceCandidateToRemotePeer(e.candidate);
      // sometimes we get candidate as null so to handle those case we make if block
      if (e.candidate) {
        socket.emit("sendIceCandidateToSignalingServer", {
          iceCandidate: e.candidate,
          iceUserName: userName,
          // on the server it is going to add this ice candidate to that offer ice candidate or answer ice candidate so we need to let the server now if we are the offer or not so we will make a boolean to keep track of that.
          didIOffer,
        });
      }
    });
    if (offerObj) {
      // this won't be set when called from caLL()
      // will be set when we call from answeroffer()
      // for debugging
      // console.log(peerConnection.signalingState); //should be stable becoz no set description has been run yet
      // this is an async process that why we put awit
      await peerConnection.setRemoteDescription(offerObj.offer);
      // console.log(peerConnection.signalingState); //should be have-remote-offer, becoz client2 has setremotedescription on the offer
      //no go to answer offer
    }
    resolve();
  });
};
document.querySelector("#call").addEventListener("click", call);
