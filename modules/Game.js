var Tile = require('./Tile'),
	Player = require('./Player'),
	gameOverWnd = require('./GameOver'); //gameOverWindow

module.exports = function(){
	var ctx;

	var $board = $("canvas#game");

	var data = [];

	var boardSize = 10; //10x10

	var player1, player2;

	var over = false;

	var actions = new(function(){
		var all = [];

		this.add = function(x, y, w, h, obj){
			return all.push([x, y, x+w, y+h, obj]);
		}

		this.clear = function(){
			all=[];
		}

		this.do = function(ev){
			if(!all.length) return false;

			for(var i in all){
				if(!all.hasOwnProperty(i)) return false;
				if(ev.offsetX>=all[i][0] && ev.offsetX<=all[i][2] && ev.offsetY>=all[i][1] && ev.offsetY<=all[i][3]){
					for(var j in all[i][4]){
						if("on"+ev.type==j && typeof all[i][4][j]==='function') all[i][4][j]();
					}
				} else {
					for(var j in all[i][4]){
						if(j=="onmouseout" && typeof all[i][4][j]==='function') all[i][4].onmouseout();
					}
				}
			}
		}
	})();

	this.inited = false;

	if (!window.requestAnimationFrame) {
		window.requestAnimationFrame = (function() {
			return window.webkitRequestAnimationFrame ||
				   window.mozRequestAnimationFrame ||
				   window.oRequestAnimationFrame ||
				   window.msRequestAnimationFrame;
		})();
	}

	this.tick = function(){
		window.gameLoop = window.requestAnimationFrame(this.tick.bind(this));

		this.update();
		this.render();
	}

	this.update = function(){
		for(var i=data.length; i--;){
			data[i].update();
		}
		if(over) over.update();
	}

	this.render = function(){
		ctx.clearRect(0, 0, $board[0].width, $board[0].height);
		for(var i=data.length; i--;){
			data[i].draw(ctx);
		}
		if(over) over.draw(ctx);
	}

	this.onmousedown = function(d){
		if(over) return false;
		if(data[d].isFlipped()) return false;

		data[d].onmouseout();
		this.doMovement(d);
	}

	this.doMovement = function(idx){
		var me = player1.move ? player1 : player2,
			enemy = player1.move ? player2 : player1;
		data[idx].flip(me.shape);
		me.moves++;

		var hasWon = this.checkWin(idx, me);

		if(hasWon) return this.gameOver(me, hasWon);

		me.move = false;
		enemy.move = true;
	}

	this.checkWin = function(idx, player){
		if(player.moves<5) return false;

		var dirs = [
			[[-1,-1],[1,1]], //skew :: top+left->bottom+right
			[[1,-1],[-1,1]], //skew :: top+right->bottom+left
			[[0,-1],[0,1]], //vertical
			[[-1,0],[1,0]] //horizontal
		],
		x = idx % boardSize,
		y = Math.floor(idx/boardSize);

		for(var i=dirs.length; i--;){
			var sum = -1, ox=x, oy=y; //'sum' starts at -1 because loop scans twice basic attack
			var idxs = [];

			idxs[idx]=true;

			while(data[ox+oy*boardSize].equals(player.shape)){
				sum++;
				idxs[ox+oy*boardSize]=true;

				ox+=dirs[i][0][0];
				oy+=dirs[i][0][1];
				if(ox<0 || oy<0 || ox>=boardSize || oy>=boardSize) break;
			}

			ox=x; oy=y;

			while(data[ox+oy*boardSize].equals(player.shape)){
				sum++;
				idxs[ox+oy*boardSize]=true;

				ox+=dirs[i][1][0];
				oy+=dirs[i][1][1];
				if(ox<0 || oy<0 || ox>=boardSize || oy>=boardSize) break;
			}

			if(sum>=5) return idxs;
		}

		return false;
	}

	this.gameOver = function(player, winnPos){
		this.inited=false;

		var center = $board.width()/2;

		for(var i=data.length; i--;){
			if(typeof winnPos[i] !== 'undefined'){
				data[i].center(center-25);
				data[i].slide({x:center-25, y:110});
			}
			else data[i].hide();
		}

		actions.clear();

		over = new gameOverWnd(player.shape, center, actions);
	}

	this.init = function(){
		this.inited = true;
		$board[0].width = $board[0].height = boardSize*59+10;

		player1 = new Player();
		player2 = new Player();

		player1.move = true;
		player1.shape = "nought";

		$board.unbind("click mousemove mouseout").bind("click mousemove mouseout", actions.do);

		ctx = $board[0].getContext("2d");

		for(var i=0; i<boardSize; i++){
			for(var j=0; j<boardSize; j++){
				var x = j*59+10,
					y = i*59+10,
					d = data.push(new Tile(x, y, "blank"));

				(function(d, self){
					actions.add(x,y,50,50, {
						onclick: self.onmousedown.bind(self, d),
						onmousemove: data[d].onmousemove.bind(data[d]),
						onmouseout: data[d].onmouseout.bind(data[d])
					});
				})(--d, this);

			}
		}

		this.tick();
	}
};
