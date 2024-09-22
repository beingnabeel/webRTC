const supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
// here the above one will give me boolean values that whether a particular property is supported or not
// but it will be much better if it could provide with more details such as what values it could accept and the range we could or should provide.
// so we can use getCapablities method for that

console.log(supportedConstraints);

const changeVideoSize = () => {
  //   // so here these will provide us with the accepted threshold values
  //   stream.getTracks().forEach((track) => {
  //     const capabilities = track.getCapabilities();
  //     console.log(capabilities);
  //   });
  stream.getVideoTracks().forEach((track) => {
    // track is a video track
    // we can get it's capabilities from .getCapabilities();
    // or we can apply new constraints with applyConstraints();
    const capabilities = track.getCapabilities();
    const height = document.querySelector("#vid-height").value;
    const width = document.querySelector("#vid-width").value;
    const vConstraints = {
      //   height: height,
      //   width: width,
      //  so here if you provide some ridiculous height and width value such as 10000 then becomes the defaut size because you have not specified exact
      height: {
        exact:
          height < capabilities.height.max ? height : capabilities.height.max,
      },
      width: {
        exact: width < capabilities.width.max ? width : capabilities.width.max,
      },
      //   frameRate: 5,    //this is really low framerate and your video feed will be choppy
      //   so when we have both height and width specified it's gonna overwrite the aspect ratio
      //   aspectRatio: 10,
    };
    track.applyConstraints(vConstraints);
  });
};
