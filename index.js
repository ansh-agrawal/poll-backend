const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let currentPoll = null; 
let students = {}; 

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (name) => {
    students[socket.id] = name;
    console.log(name, "joined");
  });

  socket.on("createPoll", ({ question, options }) => {
    currentPoll = { question, options, answers: {} };
    io.emit("newPoll", currentPoll);
  });

  socket.on("submitAnswer", (answer) => {
    if (currentPoll) {
      currentPoll.answers[students[socket.id]] = answer;
      io.emit("pollResults", currentPoll);
    }
  });

  socket.on("disconnect", () => {
    delete students[socket.id];
  });
});

server.listen(4000, () => console.log("Backend running on http://localhost:4000"));
