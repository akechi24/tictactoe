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