import express from "express";
import cors from "cors";
import { Server } from "http";
import { Socket } from "socket.io";
import path from "path";

const main = () => {
	const app = express();

	app.use(cors({ credentials: true, origin: "http://localhost:3000" }));

	app.use(express.json());
	app.set("view engine", "ejs");
	app.set("views", path.join(__dirname, "views"));
	app.use(express.static(path.join(__dirname, "/public/")));

	app.get("/", (_, res) => {
		return res.render("index");
	});

	let activeUsers: { userId: string; userName: string }[] = [];
	const server = new Server(app);
	const io = require("socket.io")(server);

	io.on("connection", (socket: Socket) => {
		console.log("Client connected");

		socket.on("login", (userName: string) => {
			io.to(socket.id).emit("activeUsers", activeUsers);
			const currentUser = { userName, userId: socket.id };
			activeUsers.push(currentUser);
			socket.broadcast.emit("newUser", currentUser);
		});

		socket.on("move", ({ move, oponentId }) => {
			socket.to(oponentId).emit("move", move);
		});

		socket.on("joinGame", (userId) => {
			console.log("room joined");
			io.to(userId).emit("joinGame", socket.id);
		});

		socket.on("invite", ({ oponentId, currentUserName }) => {
			io.to(oponentId).emit("invite", {
				oponentName: currentUserName,
				oponentId: socket.id,
				color: "black",
			});
			console.log("Invite sent");
		});

		socket.on("roomEvent", () => {
			io.to("roomName").emit("roomEvent", "Hello There");
		});

		socket.on("disconnect", () => {
			activeUsers = activeUsers.filter((user) => user.userId !== socket.id);
			socket.broadcast.emit("logout", socket.id);
		});
	});

	server.listen(5000, () => {
		console.log("Listening on port 5000");
	});
};

main();
