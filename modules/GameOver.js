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