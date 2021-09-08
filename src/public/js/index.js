var game;
var board;

window.onload = function () {
	initGame();
};

function initGame() {
	const config = { draggable: true, position: "start", onDrop: handleMoves };
	board = new ChessBoard("board", config);
	game = new Chess();
}

function handleMoves(from, to) {
	const move = game.move({ from, to });
	if (move === null) return "snapback";
}
