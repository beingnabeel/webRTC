// const path = require("path");
const fs = require("fs");
const https = require("https");
const express = require("express");
const app = express();
const socketio = require("socket.io");
app.use(express.static(__dirname));
// we need a key and cert to run https
// we generated them with mkcert
// $ mkcert create-ca
// $ mkcert create-cert
const key = fs.readFileSync("cert.key");
const cert = fs.readFileSync("cert.crt");
// we changed our express setup so we can use https
// pass the key and cert to createServer on https
const expressServer = https.createServer({ key, cert }, app);
// create our socket.io server .... it will listen on our express port
const io = socketio(expressServer);
expressServer.listen(8181);
// we will use mkcert node module to create our https server
// offers will contain{} objects
const offers = [
  // offererUserName
  // offer
  // offerIceCandidates
  //   answererUserName
  // answer
  // anwererIceCandidates
];
const connectedSockets = [
  // username, socketId
];
io.on("connection", (socket) => {
  //   console.log("Someone is connected");
  const userName = socket.handshake.auth.userName;
  const password = socket.handshake.auth.password;
  if (password !== "x") {
    socket.disconnect(true);
    return;
  }
  connectedSockets.push({
    socketId: socket.id,
    userName,
  });
  //A new client has joined. If there are any offers available, emit them out.
  if (offers.length) {
    socket.emit("availableOffers", offers);
  }
  socket.on("newOffer", (newOffer) => {
    offers.push({
      offererUserName: userName,
      offer: newOffer,
      offerIceCandidates: [],
      answererUserName: null,
      answer: null,
      answererIceCandidates: [],
    });
    // console.log(newOffer.sdp.slice(50));
    // send out to all connected sockets EXCEPT the caller
    socket.broadcast.emit("newOfferAwaiting", offers.slice(-1));
  });

  socket.on("sendIceCandidateToSignalingServer", (iceCandidateObj) => {
    const { didIOffer, iceUserName, iceCandidate } = iceCandidateObj;
    // console.log(iceCandidate);
    // we need to take this ice candidate and find the offer that it belongs to and then if didIOffer is true we need to add it to the offer ice candidate.
    if (didIOffer) {
      // here if didIOffer means i am the offer the person who sent this and this is my name go find in the offer array that particular offer where my name matches in the offer as well as what i just sent you
      const offerInOffers = offers.find(
        (o) => o.offererUserName === iceUserName
      );
      //   if we find one
      if (offerInOffers) {
        offerInOffers.offerIceCandidates.push(iceCandidate);
        // the icecandidate that just came in
        // come back to this....
        // if the answer is already here, emit the iceCandidate to that user.
      }
    }
    console.log(offers);
  });
});
