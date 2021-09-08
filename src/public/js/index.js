let client = io.connect();
let game;
let board;
let activeUsers = [];

//Game
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
	game.move(move);
	board.position(game.fen());
});

client.on("joinGame", (data) => initGame(data));

//UserList
client.on("activeUsers", (users) => {
	activeUsers = users;
	setActiveUsers(activeUsers);
});

client.on("logout", (userId) => {
	activeUsers = activeUsers.filter((user) => user.userId !== userId);
	setActiveUsers(activeUsers);
});

client.on("newUser", (newUser) => {
	activeUsers.push(newUser);
	setActiveUsers(activeUsers);
});

const setActiveUsers = (activeUsers) => {
	$("#active-users").html("");
	activeUsers.forEach((user) => {
		const html = `<tr>
			<td>${user.userName}</td>
			<td>${user.userId}</td>
			</tr>`;
		$("#active-users").append(
			$(html).on("click", () => console.log(user.userId))
		);
	});
};

//Login
$("#login-form").on("submit", (e) => {
	e.preventDefault();
	const userName = $("#username").val();
	client.emit("login", userName);
	$("#login-page").hide();
	$("#home-page").show();
	$("#title-name").text(userName);
	currentUserName = userName;
});
