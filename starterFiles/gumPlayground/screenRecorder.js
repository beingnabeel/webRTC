let mediaRecorder;
let recordedBlobs;
const startRecording = () => {
  if (!stream) {
    //you could use a mediaStream
    alert("No current feed");
    return;
  }
  console.log("Start recording");
  //   invoking the mediarecorder constructor.
  //   if we are not passing any options here which wll containe the codec type and stuff then browser will chose it automatically.\
  recordedBlobs = []; // an array to hold the blobs for the playback
  //   you could use a mediaStream to record.
  mediaRecorder = new MediaRecorder(stream); //make a mediaRecorder from the constructor
  //   console.log(mediaRecorder);
  mediaRecorder.ondataavailable = (e) => {
    // ondataavailable will run when the stream ends, or stopped or we specifically asked for it
    console.log("Data is available for the media recorder !");
    recordedBlobs.push(e.data); //this is gonna start the feed.
  };
  mediaRecorder.start(); // start the recording
  changeButtons([
    "green",
    "green",
    "blue",
    "blue",
    "green",
    "blue",
    "grey",
    "blue",
  ]);
};

const stopRecording = () => {
  if (!mediaRecorder) {
    alert("Please record before stopping!");
    return;
  }
  console.log("Stop recording");
  mediaRecorder.stop(); // stop the recording
  // so when stop runs the ondataavailable event will be fired.
  changeButtons([
    "green",
    "green",
    "blue",
    "blue",
    "green",
    "green",
    "blue",
    "blue",
  ]);
};

const playRecording = () => {
  console.log("play recording");
  if (!recordedBlobs) {
    alert("No Recording saved");
    return;
  }
  //   so here the superBuffer is gonna be new blob from the recordedBlobs array
  const superBuffer = new Blob(recordedBlobs);
  //   superbuffer is a super buffer of our array of blobs
  //   here in this blob we can also specify the mime type
  //   so here we are gonna play the recorded feed in the other-video area
  const recordedVideoEl = document.querySelector("#other-video");
  //   recordedVideoEl.srcObject = window.URL.createObjectURL(superBuffer);  //here we are giving it the url and not the stream so we will do the below thing
  recordedVideoEl.src = window.URL.createObjectURL(superBuffer);
  recordedVideoEl.controls = true; //this is for controling the play pause of video
  recordedVideoEl.play();
  changeButtons([
    "green",
    "green",
    "blue",
    "blue",
    "green",
    "green",
    "green",
    "blue",
  ]);
};
