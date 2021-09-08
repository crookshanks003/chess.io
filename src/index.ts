import express from "express";
import cors from "cors";
import { Server } from "http";
import { Socket } from "socket.io";
import path from "path";

const main = () => {
    const app = express();

    app.use(cors());

    app.use(express.json());
    app.set("view engine", "ejs");
    app.set("views", path.join(__dirname, "views"));
    app.use(express.static(path.join(__dirname, "/public/")));

    app.get("/", (req, res) => {
        return res.render("index");
    });

    const server = new Server(app);
    const io = require("socket.io")(server);

    io.on("connection", (socket: Socket) => {
        console.log("Client connected");
        socket.on("message", msg => {
            console.log(msg);
        });
    });

    server.listen(5000, () => {
        console.log("Listening on port 5000");
    });
};

main();
