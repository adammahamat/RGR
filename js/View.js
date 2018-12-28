var View = function() {
}

View.prototype.bindController = function(controller) {
	this.controller = controller;
}

View.prototype.loop = function() {
	var then = 0;
	
	function render(now) {
		now *= 0.001;
		const dt = now - then;
		then = now;
		
		this.controller.update(dt);
		this.redraw();
		
		requestAnimationFrame(render.bind(this));
	}
	
	requestAnimationFrame(render.bind(this));
}

View.prototype.redraw = function() {
	var ctx = document.getElementById('canvas').getContext('2d');
	
	ctx.clearRect(0, 0, 600, 475);
	
	// blocks
	var blocks = this.controller.getBlocks();
	
	ctx.fillStyle = 'yellow';
	for (var i = 0; i < blocks.length; i++) {
		var cur = blocks[i];
		
		if (!cur.exist)
			continue;
		
		var x = cur.x - cur.width / 2;
		var y = cur.y - cur.height / 2;
		var w = cur.width;
		var h = cur.height;
		
		ctx.fillRect(x, y, w, h);
		ctx.strokeRect(x, y, w, h);
	}
	
	// ball
	ctx.fillStyle = 'red';
	
	var mb = this.controller.getBall();
	
	ctx.beginPath();
	ctx.arc(mb.x, mb.y, mb.radius, 0, Math.PI * 2);
	ctx.stroke();
	ctx.fill();
	
	// platform
	ctx.fillStyle = 'green';
	
	var mp = this.controller.getPlatform();
	
	var x = mp.x - mp.width / 2;
	var y = mp.y - mp.height / 2;
	var w = mp.width;
	var h = mp.height;
	
	ctx.fillRect(x, y, w, h);
	ctx.strokeRect(x, y, w, h);
	
	//bonus
	var mb = this.controller.getBonus();
	
	if (mb.exist) {	
		var x = mb.x - mb.width / 2;
		var y = mb.y - mb.height / 2;
		var w = mb.width;
		var h = mb.height;
		
		if (mb.type == BONUS_SMALL)
			ctx.fillStyle = '#aa0000';
		else if (mb.type == BONUS_BIG)
			ctx.fillStyle = '#00aa00';
		else if (mb.type == BONUS_FAST)
			ctx.fillStyle = '#00aaaa';
		
		ctx.fillRect(x, y, w, h);
		ctx.strokeRect(x, y, w, h);
	}
}

View.prototype.init = function() {
	var field = document.getElementById('field');
	
	var canvas = document.createElement('canvas');
	canvas.id = 'canvas';
	canvas.setAttribute('width', '600px');
	canvas.setAttribute('height', '475px');
	
	field.appendChild(canvas);
		
	this.loop();
}

var view = new View();