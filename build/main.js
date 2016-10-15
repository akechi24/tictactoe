(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Game = require('./modules/Game');

window.initGame = function(){
	if(typeof this.gameLoop !== 'undefined') this.cancelAnimationFrame(this.gameLoop);
	var game = new Game();
	game.init();
}

initGame();
},{"./modules/Game":3}],2:[function(require,module,exports){
module.exports = function(x,y, text, actions, onmousedown){
	var inited=false;
	
	var button = new Image();
	button.src = "images/button.png";
	button.onload = function(){
		inited=true;
		x-=this.width/2;
		y-=this.height/2;
		actions.add(x, y, this.width, this.height, {onclick: onmousedown});
	}

	this.draw = function(ctx){
		if(!inited) return;

		ctx.drawImage(button, x, y);

		ctx.font="bold 20px verdana";
		ctx.fillStyle="#ffffff";
		ctx.fillText(text, x+(button.width/2-ctx.measureText(text).width/2), y+35);
	}
}
},{}],3:[function(require,module,exports){
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
},{"./GameOver":4,"./Player":5,"./Tile":6}],4:[function(require,module,exports){
var Button = require('./Button');

module.exports = function(shape, center, actions){
	var visibility=0, inited=false,
		btns = [];

	this.update = function(){
		if(visibility<1 && inited){
			visibility+=0.04;
			visibility=Math.min(1, visibility);
		}
	}

	this.draw = function(ctx){
		ctx.save();

		var text = "The "+ shape +" player won!";

		ctx.globalAlpha = visibility;
		ctx.font="40px verdana";
		ctx.shadowColor="black";
		ctx.shadowBlur=7;
		ctx.lineWidth=4;
		ctx.strokeText(text,center-ctx.measureText(text).width/2,280);
		ctx.shadowBlur=0;
		ctx.fillStyle="#bbb3c6";
		ctx.fillText(text,center-ctx.measureText(text).width/2,280);

		ctx.restore();

		for(var i=btns.length; i--;){
			btns[i].draw(ctx);
		}
	}

	this.init = function(){
		inited=true;

		btns = [
			new Button(center, 430, "Play again", actions, initGame.bind(window))
			/*,
			new Button(center, 500, "Exit", actions, function(){
				$(".mg-tictactoe-window > .closebut").click();
			})*/
		];
	}

	setTimeout(this.init, 1700);
};
},{"./Button":2}],5:[function(require,module,exports){
module.exports = function(){
	this.move = false;
	this.moves = 0;
	this.shape = "cross";
};
},{}],6:[function(require,module,exports){
module.exports = function(x, y, t){ //t=tile type (blank, cross, nought)
	var tileSize = 50;
	var tile, anim = 0,
		hover = false, visible = 1,
		center, speed=0;

	this.update = function(){
		if(anim > 0) anim-= 0.05;
		if(visible > 0 && visible < 1) this.hide();
		if(center){
			if(x==center.x && y==center.y){
				speed=0;
				center=false;
				return;
			}

			if(center.x!=x) center.x>x ? x+=speed : x-=speed;
			if(center.y!=y) center.y>y ? y+=speed : y-=speed;

			if(Math.abs(center.x-x)<speed) x = center.x;
			if(Math.abs(center.y-y)<speed) y = center.y;
		}
	}

	this.draw = function(ctx){
		if(visible==0) return;
		if(anim<=0){
			ctx.globalAlpha = visible;
			ctx.drawImage(tile, x, y);
			return;
		}

		var res = 2;
		var p = this.init(anim > 0.5 ? "blank" : t),
			s = -Math.abs(2*anim -1)+1;
		for(var i=0; i<tileSize; i+=res){
			var j = anim > 0.5 ? i : tileSize - i;

			ctx.drawImage(p, i, 0, res, tileSize,
				x + i - s*i + tileSize/2*s,
				y - j*s*0.2,
				res,
				tileSize + j*s*0.4
			);
		}
	}

	this.onmousemove = function(){
		if(this.isFlipped() || hover) return;

		hover = true;
		tile = this.init(t);
	}

	this.onmouseout = function(){
		if(!hover) return;

		hover = false;
		tile = this.init(t);
	}

	this.flip = function(next){
		tile = this.init(next);
		t=next;
		anim = 1;
	}

	this.hide = function(){
		visible -= 0.05;
		visible = Math.max(visible,0);
	}

	this.center = function(c, fun){
		speed=Math.sqrt(Math.pow(x-c,2)+Math.pow(y-c,2))/30; //<===time
		center={x:c, y:c, fun:fun};
	}

	this.slide = function(pos){
		setTimeout(function(){
			speed=3;
			center={x:pos.x, y:pos.y};
		},1200);
	}

	this.isFlipped = function(){
		return t !== "blank";
	}

	this.equals = function(til){
		return t==til;
	}

	this.init = function(til){
		var canvas = $("<canvas/>", {width:tileSize, height:tileSize})[0];

		var ctx = canvas.getContext("2d");
		ctx.fillStyle = !hover ? "#bbb3c6" : "#725f8c";
		ctx.lineWidth = 4;
		ctx.strokeStyle = "white";

		ctx.fillRect(0, 0, tileSize, tileSize);
		switch(til){
			case 'blank': break;
			case 'cross':
				ctx.beginPath();
				ctx.moveTo(10, 10);
				ctx.lineTo(40, 40);
				ctx.moveTo(40, 10);
				ctx.lineTo(10, 40);
				ctx.stroke();
				break;
			case 'nought':
				ctx.beginPath();
				ctx.arc(tileSize/2, tileSize/2, 16, 0, 2*Math.PI);
				ctx.stroke();
				break;
		}

		var dTile = new Image();
		dTile.src = canvas.toDataURL();
		return dTile;
	}

	tile = this.init(t);
};
},{}]},{},[1]);
