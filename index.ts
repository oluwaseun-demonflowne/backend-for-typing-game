import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { Socket } from "socket.io";
import { hundredWordsArray } from "./words";
const http = require("http");
const cors = require("cors");

dotenv.config();

const app: Express = express();
const { Server } = require("socket.io");
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const gamers: info[] = [];

type info = {
  link: string;
  player: string;
  score: number;
  room: string | string[];
  start: boolean;
};

type join = {
  link: string;
  player: string;
};



io.on("connection", (socket: Socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data: info) => {
    gamers.push({ ...data });
    // console.log(gamers);
    socket.join(data?.room);
    console.log(`User with ID: ${socket.id} joined ${data.room}`);
    // socket
    //   .to(data.room)
    //   .emit(
    //     "recieve list of users",
    //     "gamers.filter((i) => i.inviteLink === data.inviteLink)"
    //   );
  });

  //   socket.on("get-users", () => {
  //     socket.to(data.inviteLink).emit(
  //       "recieve list of users",
  //       gamers.filter((i) => i.inviteLink === data.inviteLink)
  //     );
  //   });
  // socket.on("get_room", (data: join) => {
  //   // console.log(data, "this is");

  //   gamers.push({ ...data, score: 0 });
  //   console.log(gamers);
  //   socket.join(data.link);
  //   io.to(data.link).emit("receive_word", hundredWordsArray[0]);
  //   io.to(data.link).emit(
  //     "gamers",
  //     gamers.filter((i) => i.link === data.link)
  //   );
  // });

  socket.on("user_clickStart", (data:join) => {
    const playerIndex = gamers.findIndex(player => player.player === data.player);
    if (playerIndex !== -1) {
        gamers[playerIndex].start = true;
    }
    io.to(data.link).emit(
      "gamers",
      gamers.filter((i) => i.link === data.link)
    );
  })


  socket.on("get_room", (data) => {
    const existingPlayer = gamers.find(
      (player) => player.player === data.player
    );
    if (!existingPlayer) {
      gamers.push({ ...data, score: 0 , start: false});
    }
    console.log(gamers);
    socket.join(data.link);
    io.to(data.link).emit("receive_word", hundredWordsArray[Math.floor(Math.random() * hundredWordsArray.length)]);
    io.to(data.link).emit(
      "gamers",
      gamers.filter((i) => i.link === data.link)
    );
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

server.listen(3001, () => {});
