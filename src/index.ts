import express from "express";
import cors from "cors";
import { Server } from "http";
import path from "path";
import socket from "./socket"

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

	const server = new Server(app);
	socket(server)

	server.listen(5000, () => {
		console.log("Listening on port 5000");
	});
};

main();
