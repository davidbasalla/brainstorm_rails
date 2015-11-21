function DeleteBox(x, y){
    
    this.x = x;
    this.y = y;
    this.w = 8;
    this.offset = 5;
}

DeleteBox.prototype.contains = function(mx, my) {

    return  (this.x <= mx) && (this.x + this.w >= mx) &&
        (this.y + this.offset <= my) && (this.y + this.offset + this.w >= my);
    
};

DeleteBox.prototype.draw = function(ctx){
    
    ctx.strokeStyle = 'lightgrey';
    
    ctx.lineWidth = 4;
    ctx.beginPath();

    var y = this.y + this.offset;

    ctx.moveTo(this.x, y);
    ctx.lineTo(this.x + this.w, y + this.w);
    
    ctx.moveTo(this.x + this.w, y);
    ctx.lineTo(this.x, y + this.w);
    
    ctx.closePath();
    ctx.stroke();
};
