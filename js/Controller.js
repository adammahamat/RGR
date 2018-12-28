var Controller = function (View, Model) {
    this.view = View;
    this.model = Model;
	
	this.sound = document.querySelector('.jump');
};

Controller.prototype.init = function() {
    this.model.init();
	this.view.init();
	
	document.onmousemove = this.handleMouseMove.bind(this);
};

Controller.prototype.getBlocks = function() {
	return this.model.getBlocks();
}

Controller.prototype.getBall = function() {
	return this.model.getBall();
}

Controller.prototype.getPlatform = function() {
	return this.model.getPlatform();
}

Controller.prototype.update = function(dt) {
	var play = this.model.update(dt);
	if (play)
		this.sound.play();
}

Controller.prototype.handleMouseMove = function(event) {
	event = event || window.event;
	
	var x = event.pageX;
	this.model.moveMouse(x);
}

Controller.prototype.getBonus = function() {
	return this.model.getBonus();
}

var controller = new Controller(view, model);

view.bindController(controller);

controller.init();