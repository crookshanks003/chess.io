let client = io.connect();
let game;
let board;
let currentUserName;
let currentGame = { oponentId: "", color: "" };
let activeUsers = [];

function setLoading(loading) {
	if (loading) {
		$("#loader").show();
	} else {
		$("#loader").hide();
	}
}

//Game
function initGame() {
	const config = {
		draggable: true,
		position: "start",
		onDrop: handleMoves,
		orientation: currentGame.color,
		onDragStart
	};
	board = new ChessBoard("board", config);
	game = new Chess();
}

function handleMoves(from, to) {
	const move = game.move({ from, to });
	if (move === null) {
		return "snapback";
	} else {
		client.emit("move", { move, oponentId: currentGame.oponentId });
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

function onDragStart() {
	if(game.game_over() || game.turn() !== currentGame.color[0]){
		return false;
	}
}

client.on("move", (move) => {
	game.move(move);
	board.position(game.fen());
});

client.on("invite", ({ oponentName, oponentId, color }) => {
	if (window.confirm(`${oponentName} invited you to join a game`)) {
		currentGame = { oponentId: oponentId, color: color };
		client.emit("joinGame", oponentId);
		$("#home-page").hide();
		$("#board-page").show();
		initGame();
	}
});

client.on("joinGame", (oponentId) => {
	currentGame = { oponentId, color: "white" };
	setLoading(false);
	$("#home-page").hide();
	$("#board-page").show();
	initGame();
});

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
			$(html).on("click", () => {
				client.emit("invite", {
					oponentId: user.userId,
					currentUserName,
				});
				$("#home-page").hide();
				setLoading(true);
			})
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
