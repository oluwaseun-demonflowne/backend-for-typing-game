"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const words_1 = require("./words");
const http = require("http");
const cors = require("cors");
dotenv_1.default.config();
const app = (0, express_1.default)();
const { Server } = require("socket.io");
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});
const gamers = [];
io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);
    socket.on("join_room", (data) => {
        gamers.push(Object.assign({}, data));
        // console.log(gamers);
        socket.join(data === null || data === void 0 ? void 0 : data.room);
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
    socket.on("user_clickStart", (data) => {
        const playerIndex = gamers.findIndex(player => player.player === data.player);
        if (playerIndex !== -1) {
            gamers[playerIndex].start = true;
        }
        io.to(data.link).emit("gamers", gamers.filter((i) => i.link === data.link));
    });
    socket.on("get_room", (data) => {
        const existingPlayer = gamers.find((player) => player.player === data.player);
        if (!existingPlayer) {
            gamers.push(Object.assign(Object.assign({}, data), { score: 0, start: false }));
        }
        console.log(gamers);
        socket.join(data.link);
        io.to(data.link).emit("receive_word", words_1.hundredWordsArray[Math.floor(Math.random() * words_1.hundredWordsArray.length)]);
        io.to(data.link).emit("gamers", gamers.filter((i) => i.link === data.link));
    });
    socket.on("disconnect", () => {
        console.log("User Disconnected", socket.id);
    });
});
server.listen(3001, () => { });
