let client = io.connect();
let game;
let board;

function initGame(data) {
	const config = {
		draggable: true,
		position: "start",
		onDrop: handleMoves,
		orientation: data.color,
	};
	board = new ChessBoard("board", config);
	game = new Chess();
}

function handleMoves(from, to) {
	const move = game.move({ from, to });
	if (move === null) {
		return "snapback";
	} else {
		client.emit("move", move);
	}
	if (game.game_over()) {
		let winner;
		if (game.in_checkmate()) {
			winner = move.color === "w" ? "White Won" : "Black Won";
		} else if (
			game.in_draw() ||
			game.in_stalemate() ||
			game.in_threefold_repetition()
		) {
			winner = "Game Draw";
		}
		$("#result").text(winner);
	}
}

client.on("move", (move) => {
	console.log(move);
	game.move(move);
	board.position(game.fen());
});

client.on("joinGame", (data) => initGame(data));
client.on("roomEvent", (data) => console.log(data));
client.on("activeUsers", (data) => console.log(data));

//Login
$("#login-form").on("submit", (e) => {
	e.preventDefault();
	const userName = $("#username").val();
	client.emit("login", userName);
	console.log("Sent request");
	$("#login-page").hide();
	$("#home-page").show();
	$("#title-name").text(userName)
});
