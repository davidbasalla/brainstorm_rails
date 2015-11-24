function DeleteBox(x, y, ctx){
    
    this.x = x;
    this.y = y;
    this.ctx = ctx;

    this.w = 8;
    this.offset = 5;
}

DeleteBox.prototype.contains = function(mx, my) {

    return  (this.x <= mx) && (this.x + this.w >= mx) &&
        (this.y + this.offset <= my) && (this.y + this.offset + this.w >= my);
    
};

DeleteBox.prototype.draw = function(ctx){
    this.ctx = ctx;

    this.ctx.strokeStyle = 'lightgrey';
    
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();

    var y = this.y + this.offset;

    this.ctx.moveTo(this.x, y);
    this.ctx.lineTo(this.x + this.w, y + this.w);
    
    this.ctx.moveTo(this.x + this.w, y);
    this.ctx.lineTo(this.x, y + this.w);
    
    this.ctx.closePath();
    this.ctx.stroke();
};
