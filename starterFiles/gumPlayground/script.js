const videoEl = document.querySelector("#my-video");

let stream = null; //Init stream var so we can use anyhwere
let mediaStream = null; //Init mediaStream var for screenShare
const constraints = {
  audio: true, //use your headphones, or be prepared for feedback
  video: true,
};
const getMicAndCamera = async (e) => {
  //   we can specify try catch block to handle the situation where the user doesn't allow access to the audio or video
  try {
    // this is our starting point in every single webrtc app
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    // so this return a promise so we will be using await
    // now we are gonna put this stream in our video tag.
    console.log(stream);
    changeButtons([
      "green",
      "blue",
      "blue",
      "grey",
      "grey",
      "grey",
      "grey",
      "grey",
    ]);
  } catch (error) {
    console.log("User denied access to constraints");
    //user denied access to constraints
    console.log(error);
  }
};
// showing the audio and video
const showMyFeed = (e) => {
  console.log("show my feed is working");
  //   the case where you don't have a steam means you havn't given the permission and trying to access video fee
  if (!stream) {
    alert("Stream still loading");
    return;
  }
  videoEl.srcObject = stream; //this will set our MediaStream (stream ) to our video tag.
  changeButtons([
    "green",
    "green",
    "blue",
    "blue",
    "blue",
    "grey",
    "grey",
    "blue",
  ]);
  const tracks = stream.getTracks();
  console.log(tracks);
};

// stopping the audio and video
const stopMyFeed = (e) => {
  if (!stream) {
    alert("Stream still loading");
    return;
  }
  console.log("stpping my feed");
  const tracks = stream.getTracks();
  tracks.forEach((track) => {
    // console.log(track)
    track.stop(); //disassociate the track with the source.
  });
  changeButtons([
    "blue",
    "grey",
    "grey",
    "grey",
    "grey",
    "grey",
    "grey",
    "grey",
  ]);
};

// attatching this function to my share button
// here we will be grabbing the event and then call getMicAndCamera and we will be passing event it that
document
  .querySelector("#share")
  .addEventListener("click", (e) => getMicAndCamera(e));

// now we will be capturing the video stream

document
  .querySelector("#show-video")
  .addEventListener("click", (e) => showMyFeed(e));

//   stopping the video feed
document
  .querySelector("#stop-video")
  .addEventListener("click", (e) => stopMyFeed(e));

document
  .querySelector("#change-size")
  .addEventListener("click", (e) => changeVideoSize(e));

document
  .querySelector("#start-record")
  .addEventListener("click", (e) => startRecording(e));

document
  .querySelector("#stop-record")
  .addEventListener("click", (e) => stopRecording(e));
document
  .querySelector("#play-record")
  .addEventListener("click", (e) => playRecording(e));

document
  .querySelector("#share-screen")
  .addEventListener("click", (e) => shareScreen(e));

document
  .querySelector("#audio-input")
  .addEventListener("change", (e) => changeAudioInput(e));
document
  .querySelector("#audio-output")
  .addEventListener("change", (e) => changeAudioOutput(e));
document
  .querySelector("#video-input")
  .addEventListener("change", (e) => changeVideo(e));
