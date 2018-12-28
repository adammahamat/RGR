const FIELD_WIDTH = 600;
const FIELD_HEIGHT = 475;
const BALL_SPEED = 4;
const BONUS_CHANCE = 0.2;
const BONUS_SMALL = 1;
const BONUS_BIG = 2;
const BONUS_FAST = 3;

const LEVELS = [
	// Level 1
	[[1,1,0,1,0,0,1,0,1,1],
	 [1,0,0,0,1,1,0,0,0,1],
	 [0,1,0,1,1,1,1,0,1,0],
	 [1,0,0,0,1,1,0,0,0,1],
	 [1,1,0,1,0,0,1,0,1,1]],
	
	// Level 2
	[[1,1,1,1,1,1,1,1,1,1],
	 [0,0,0,0,1,1,0,0,0,0],
	 [0,0,0,0,1,1,0,0,0,0],
	 [0,0,0,0,1,1,0,0,0,0],
	 [0,0,1,1,1,1,1,1,0,0]],
	
	// Level 3
	[[1,1,1,1,1,1,1,1,1,1],
	 [1,0,0,0,0,0,0,0,0,1],
	 [1,0,1,1,1,1,1,1,0,1],
	 [1,0,0,0,0,0,0,0,0,1],
	 [1,1,1,1,1,1,1,1,1,1]]
]

var Model = function() {
	this.fail = false;
	
	this.blocks = [];
	
	this.ball = {
		x: 0,
		y: 0,
		radius: 0,
		vx: 0,
		vy: 0
	}
	
	this.platform = {
		x: 0,
		y: 0,
		width: 0,
		height: 0
	}
	
	this.bonus = {
		exist: false,
		type: 0,
		x: 0,
		y: 0,
		w: 0,
		h: 0
	};
	
	this.kd = 0;
	this.curBonus = 0;
}

Model.prototype.init = function() {
	var cnt = 0;
	
	var levelCnt = parseInt(Math.random() * 3);
	var level = LEVELS[levelCnt];
	
	for (var x = 0; x < 10; x++) {
		for (var y = 0; y < 5; y++) {
			var block = LEVELS[levelCnt][y][x];
			
			if (block) {
				this.blocks[cnt] = {
					x: 75 + x * 50,
					y: 50 + y * 20,
					width: 50,
					height: 20,
					exist: true
				};
				
				cnt++;
			}
		}
	}
	
	this.ball.x = 75 + (9 * 50) / 2;
	this.ball.y = 50 + 4 * 20 + 150;
	this.ball.radius = 10;
	this.ball.vx = BALL_SPEED;
	this.ball.vy = -BALL_SPEED;
	
	this.platform = {
		x: this.ball.x,
		y: 400,
		width: 100,
		height: 20
	};
}

Model.prototype.getBlocks = function() {
	return this.blocks;
}

Model.prototype.getBall = function() {
	return this.ball;
}

Model.prototype.getPlatform = function() {
	return this.platform;
}

Model.prototype.update = function(dt) {	
	var play = false;
	
	var b = this.ball;
	
	b.x += b.vx;
	b.y += b.vy;
	
	// area collisions
	if (b.x + b.radius > FIELD_WIDTH) {
		b.x = FIELD_WIDTH - b.radius;
		b.vx = -b.vx;
	}
	
	if (b.x - b.radius < 0) {
		b.x = b.radius;
		b.vx = -b.vx;
	}
	
	if (b.y - b.radius < 0) {
		b.y = b.radius;
		b.vy = -b.vy;
	}
	
	// fall
	if (b.y + b.radius > FIELD_HEIGHT && !this.fail) {
		this.fail = true;
		alert("You lose");
		location.reload();
	}
	
	// blocks
	var blocks = this.blocks;
	for (var i = 0; i < blocks.length; i++) {
		var bl = blocks[i];
		
		if (!bl.exist)
			continue;
		
		if (b.y + b.radius > bl.y - bl.height / 2
			&& b.y - b.radius < bl.y + bl.height / 2
			&& b.x + b.radius > bl.x - bl.width / 2
			&& b.x - b.radius < bl.x + bl.width / 2) {
			
			if (b.x + b.radius < bl.x - bl.width / 2 + 10 || b.x - b.radius > bl.x + bl.width / 2 - 10) {
				b.vx = -b.vx;
				b.x += b.vx;
			}
			else {
				b.vy = -b.vy;
				b.y += b.vy;
			}
			
			this.blocks[i].exist = false;
			play = true;
			
			this.bonusChance(bl);
			
			this.checkWin();
		}
	}
	
	// platform collision
	if (b.y + b.radius > this.platform.y - this.platform.height / 2
		&& b.y - b.radius < this.platform.y - this.platform.height / 4
		&& this.platform.x - this.platform.width / 2 < b.x
		&& this.platform.x + this.platform.width / 2 > b.x) {
		b.y = this.platform.y - this.platform.height / 2 - b.radius;
		b.vy = -b.vy;
	}
	
	this.ball = b;
	
	// bonus
	if (this.kd > 0)
		this.kd -= dt;
	
	if (this.curBonus != 0 && this.kd <= 0) {
		if (this.curBonus == BONUS_SMALL || this.curBonus == BONUS_BIG)
			this.ball.radius = 10;
		if (this.curBonus == BONUS_FAST) {
			this.ball.vx /= 2;
			this.ball.vy /= 2;
		}
			
		this.curBonus = 0;
		this.kd = 0;
	}
	
	if (this.bonus.exist) {
		this.bonus.y += 3;
		
		var bx = this.bonus.x;
		var by = this.bonus.y;
		var bw = this.bonus.width;
		var bh = this.bonus.height;
		
		var px = this.platform.x;
		var py = this.platform.y;
		var pw = this.platform.width;
		var ph = this.platform.height;
		
		if (this.pointInRect(bx - bw / 2, by - bh / 2, px - pw / 2, py - ph / 2, pw, ph) ||
			this.pointInRect(bx + bw / 2, by - bh / 2, px - pw / 2, py - ph / 2, pw, ph) ||
			this.pointInRect(bx - bw / 2, by + bh / 2, px - pw / 2, py - ph / 2, pw, ph) ||
			this.pointInRect(bx + bw / 2, by + bh / 2, px - pw / 2, py - ph / 2, pw, ph)) {
				this.bonus.exist = false;
				
				var type = this.bonus.type;
				if (type == BONUS_SMALL)
					this.ball.radius = 5;
				else if (type == BONUS_BIG)
					this.ball.radius = 15;
				else if (type == BONUS_FAST) {
					this.ball.vx *= 2;
					this.ball.vy *= 2;
				}
		}
		
		if (by - bh > FIELD_HEIGHT)
			this.bonus.exist = false;
	}
	
	return play;
}

Model.prototype.pointInRect = function(x, y, rx, ry, w, h) {
	if (x > rx && x < rx + w && y > ry && y < ry + h)
		return true;
	
	return false;
}

Model.prototype.moveMouse = function(x) {
	if (x < this.platform.width / 2)
		x = this.platform.width / 2;
	
	if (x > FIELD_WIDTH - this.platform.width / 2)
		x = FIELD_WIDTH - this.platform.width / 2;
	
	this.platform.x = x;
}

Model.prototype.checkWin = function() {
	for (var i = 0; i < this.blocks.length; i++)
		if (this.blocks[i].exist)
			return;
	
	alert("You win");
	location.reload();
}

Model.prototype.bonusChance = function(block) {
	if (!this.bonus.exist && this.curBonus == 0) {
		var rnd = Math.random();
		if (rnd < BONUS_CHANCE) {
			var bonus = 1 + parseInt(Math.random() * 3);
			
			this.bonus.exist = true;
			this.bonus.type = bonus;
			this.bonus.x = block.x;
			this.bonus.y = block.y;
			this.bonus.width = 50;
			this.bonus.height = 20;
			
			this.kd = 7.5;
			this.curBonus = bonus;
		}
	}
}

Model.prototype.getBonus = function() {
	return this.bonus;
}

var model = new Model();