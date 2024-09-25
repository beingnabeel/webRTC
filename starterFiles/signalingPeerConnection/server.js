// const path = require("path");
const fs = require("fs");
const https = require("https");
const cors = require("cors");
const express = require("express");
const app = express();
const socketio = require("socket.io");
app.use(express.static(__dirname));

// // CORS configuration
// app.use(
//   cors({
//     origin: ["https://localhost:8181", "https://192.168.68.104:8181"],
//     methods: ["GET", "POST"],
//     credentials: true,
//   })
// );
const allowedOrigins = [
  "https://localhost:8181",
  "https://127.0.0.1:8181",
  "https://192.168.68.104:8181",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        var msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ["GET", "POST"],
    credentials: true,
  })
);
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
const io = socketio(expressServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});
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

  socket.on("newAnswer", (offerObj, ackFunction) => {
    console.log(offerObj);
    // emit this answer (offerObj )(it only needs the answer but we are gonna send the entire offer obj) back to client1
    // in order to do that we ned clients 1 socketid
    const socketToAnswer = connectedSockets.find(
      (s) => s.userName === offerObj.offererUserName
    );
    if (!socketToAnswer) {
      console.log("No matching socket");
      return;
    }
    // otherwise we found the matching socket, so we can emit to it.
    const socketIdToAnswer = socketToAnswer.socketId;
    // we find the offer to update so we can emit it
    const offerToUpdate = offers.find(
      (o) => o.offererUserName === offerObj.offererUserName
    );
    // so here the offerObj is what client sended us and o is the offer that we have on the server.
    if (!offerToUpdate) {
      console.log("No offer to update");
      return;
    }
    // send back to the answerer all the icecandidates we have already collected.
    ackFunction(offerToUpdate.offerIceCandidates);
    offerToUpdate.answer = offerObj.answer;
    offerToUpdate.answererUserName = userName;
    // socket has a .to() which allows emitng to a "room"
    // every socket has it's own room
    socket.to(socketIdToAnswer).emit("answerResponse", offerToUpdate);
  });

  socket.on("sendIceCandidateToSignalingServer", (iceCandidateObj) => {
    const { didIOffer, iceUserName, iceCandidate } = iceCandidateObj;
    // console.log(iceCandidate);
    // we need to take this ice candidate and find the offer that it belongs to and then if didIOffer is true we need to add it to the offer ice candidate.
    if (didIOffer) {
      // this ice is coming from the offerer. send to the answerer.
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
        // 1. when the answerer answers, all existing ice candidates are sent
        // 2. Any candidates that come in after the offer has been answered, will be passed through
        if (offerInOffers.answererUserName) {
          // pass it through to the other socket
          const socketToSendTo = connectedSockets.find(
            (s) => s.userName === offerInOffers.answererUserName
          );
          if (socketToSendTo) {
            socket
              .to(socketToSendTo.socketId)
              .emit("receivedIceCandidateFromServer", iceCandidate);
          } else {
            console.log(
              "Ice candidate received but could not find the answerer"
            );
          }
        }
      }
    } else {
      // this ice is coming from the answerer. send to the offerer.
      // pass it through to the other socket
      const offerInOffers = offers.find(
        (o) => o.answererUserName === iceUserName
      );
      const socketToSendTo = connectedSockets.find(
        (s) => s.userName === offerInOffers.offererUserName
      );
      if (socketToSendTo) {
        socket
          .to(socketToSendTo.socketId)
          .emit("receivedIceCandidateFromServer", iceCandidate);
      } else {
        console.log("Ice candidate received but could not find the offerer");
      }
    }
    console.log(offers);
  });
});
