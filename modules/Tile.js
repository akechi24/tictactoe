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