import { Socket } from "socket.io";
import { Server } from "http";

export default function socket(server: Server) {
	let activeUsers: { userId: string; userName: string }[] = [];
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

		socket.on("joinGame", ({ userId, userName }) => {
			io.to(userId).emit("joinGame", { oponentId: socket.id, oponentName: userName });
		});

		socket.on("invite", ({ oponentId, currentUserName }) => {
			io.to(oponentId).emit("invite", {
				oponentName: currentUserName,
				oponentId: socket.id,
				color: "black",
			});
		});

		socket.on("rejectInvite", (userId) => {
			io.to(userId).emit("alert", "Invitation Rejected");
		});

		socket.on("roomEvent", () => {
			io.to("roomName").emit("roomEvent", "Hello There");
		});

		socket.on("disconnect", () => {
			activeUsers = activeUsers.filter((user) => user.userId !== socket.id);
			socket.broadcast.emit("logout", socket.id);
		});
	});
}
