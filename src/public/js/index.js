let client = io.connect();
let game;
let board;
let currentUserName;
let currentGame = { oponentId: "", color: "", turn: "w" };
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
		onDragStart,
	};
	board = new ChessBoard("board", config);
	game = new Chess();
}

function handleMoves(from, to) {
	const move = game.move({ from, to, promotion: "q" });
	let winner;
	if (move === null) {
		return "snapback";
	} else {
		currentGame.turn = move.color;
		winner = currentGame.turn === "w" ? "Black to move" : "White to move";
		client.emit("move", { move, oponentId: currentGame.oponentId });
	}
	if (game.game_over()) winner = gameOver(move);
	$("#result").text(winner);
}

function gameOver(move) {
	let winner;
	let reason;
	if (game.in_checkmate()) {
		winner = move.color === "w" ? "White Won" : "Black Won";
		reason = "Checkmate";
	} else if (game.in_draw()) {
		winner = "Game Draw";
		reason = "Insufficient material";
	} else if (game.in_stalemate()) {
		winner = "Game Draw";
		reason = "Stalemate";
	} else if (game.in_threefold_repetition()) {
		winner = "Game Draw";
		reason = "Threefold Repetition";
	}
	$("#result-details").append(
		$('<p id="reason" class="m-0 text-secondary">').text(reason)
	);
	$("#back").attr("disabled", false)
	currentGame = { oponentId: "", color: "", turn: "w" }
	return winner;
}

function onDragStart() {
	if (game.game_over() || game.turn() !== currentGame.color[0]) {
		return false;
	}
}

client.on("alert", (alert) => {
	setLoading(false);
	$("#home-page").show();
	window.alert(alert);
});

client.on("move", (move) => {
	game.move(move);
	board.position(game.fen());
	currentGame.turn = move.color;
	let winner = currentGame.turn === "w" ? "Black to move" : "White to move";
	if (game.game_over()) winner = gameOver(move);
	$("#result").text(winner);
});

//invitation
client.on("invite", ({ oponentName, oponentId, color }) => {
	if (window.confirm(`${oponentName} invited you to join a game`)) {
		currentGame = { oponentId: oponentId, color: color };
		client.emit("joinGame", {
			userId: oponentId,
			userName: currentUserName,
		});
		$("#home-page").hide();
		$("#board-page").show();
		initGame();
		$("#user").text(currentUserName);
		$("#oponent").text(oponentName);
	} else {
		client.emit("rejectInvite", oponentId);
	}
});

client.on("joinGame", ({ oponentId, oponentName }) => {
	currentGame = { oponentId, color: "white" };
	setLoading(false);
	$("#home-page").hide();
	$("#board-page").show();
	$("#user").text(currentUserName);
	$("#oponent").text(oponentName);
	initGame();
});

//UserList
client.on("activeUsers", (users) => {
	activeUsers = users;
	setActiveUsers(activeUsers);
});

client.on("logout", (userId) => {
	if (userId === currentGame.oponentId) {
		$("#result").text(`${currentGame.color} won`);
		$("#result-details").append(
			$('<p id="reason" class="m-0 text-secondary">').text(
				"Oponent Disconnected"
			)
		);
	}
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
