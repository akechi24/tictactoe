var Game = require('./modules/Game');

window.initGame = function(){
	if(typeof this.gameLoop !== 'undefined') this.cancelAnimationFrame(this.gameLoop);
	var game = new Game();
	game.init();
}

initGame();