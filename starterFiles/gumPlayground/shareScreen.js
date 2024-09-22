// we will use async here becoz getDisplayMedia returns a promise and we are using await for that.
const shareScreen = async () => {
  const options = {
    video: true,
    audio: false,
    surfaceSwitching: "include", //include/exclude NOT true/false
  };
  //   we need to use try catch becoz this use await
  try {
    mediaStream = await navigator.mediaDevices.getDisplayMedia(options);
  } catch (error) {
    console.log(error);
  }
  // we don't handle all button paths. To do so, you'd need to check the dom or use a ui framework.
  changeButtons([
    "green",
    "green",
    "blue",
    "blue",
    "green",
    "green",
    "green",
    "green",
  ]);
};
