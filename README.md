Online Chess game built with express and socket-io.

![](https://github.com/crookshanks003/chess.io/blob/main/src/public/img/screenshot.png?raw=true)

To run locally on your machine 
	
	yarn
	yarn build
	yarn start
	
If you are on windows

	yarn
	yarn tsc
	mkdir dist\public && mkdir dist\views
	Xcopy src\public\ dist\public /E/H/I && Xcopy src\views dist\views /E/H/I
	yarn start

[chessjs](https://github.com/jhlywa/chess.js)   [chessboardjs](https://github.com/oakmac/chessboardjs)
