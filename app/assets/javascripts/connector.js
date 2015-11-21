// Connector class, attached to a shape
function Connector(x, y, w){

    this.x = x || 0;
    this.y = y || 0;
    this.targetX = x || 0;
    this.targetY = y || 0;

    this.w = w || 5;
}

// Determine if a point is inside the shape's bounds
Connector.prototype.contains = function(mx, my) {

    return  (this.x <= mx) && (this.x + this.w >= mx) &&
        (this.y <= my) && (this.y + this.w >= my);
};
