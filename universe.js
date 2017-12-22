const MAX_COORDINATES = 600;
const NUM_POINTS = 3000;
const RADIUS = 3;
const GRAVITATIONAL_CONSTANT = 6.67;
const TIME_INTERVAL = 10;
const MOVE_INTERVAL = 100;
const COLLISION_DISTANCE = 7;


let universe = (function() {

    let exports = {};

    let points = undefined;

    exports.init = () => {
        points = Points.makePoints();
        drawPoints();
    };

    let drawPoints = () => {

        let canvas = document.getElementById('can');
        let ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, $('#can').width(), $('#can').height());

        let drawPoint = (point) => {
            if (point.mass === 0) return;
            ctx.beginPath();
            ctx.arc(point.vector.x, point.vector.y, RADIUS, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'green';
            ctx.fill();
        };

        points.points.forEach(point => drawPoint(point));
    };

    exports.move = () => {
        points.move();
        drawPoints();
    };

    let moveInterval = () => {
        exports.move();
        setTimeout(moveInterval, MOVE_INTERVAL);
    };

    exports.start = moveInterval;

    return exports;
})();

class Point {

    constructor(vector, id, mass = 1) {
        this.vector = vector;
        this.id = id;
        this.mass = mass;
    }
}

class Points {

    constructor(points) {
        this.points = points;
    }

    static makePoints() {
        let getRandomCoordinate = () => Math.random() * MAX_COORDINATES;
        let points = [];
        for (let i = 0; i < NUM_POINTS; i++) {
            points.push(new Point(new Vector(getRandomCoordinate(), getRandomCoordinate()), i));
        }
        return new Points(points);
    }

    move() {
        let getVectorAfterMove = (point, force, time) => {
            let a = force.divideScalar(point.mass);
            return point.vector.add(a.multiplyScalar(0.5 * time * time));
        };
        let newPoints = [];
        this.points.forEach(point => {
            if (point.mass === 0) return;
            let force = new Vector(0, 0);
            this.points.forEach(other => {
                if (point.id === other.id || other.mass === 0) return;
                let r = point.vector.getDistanceTo(other.vector);
                let gmm = GRAVITATIONAL_CONSTANT *  point.mass * other.mass;
                if (r > COLLISION_DISTANCE) {
                    force = force.add(Vector.fromPolar((gmm) / (r * r), point.vector.getDirectionTo(other.vector)));
                } else {
                    other.mass = 0;
                }
            });
            let vector = getVectorAfterMove(point, force, TIME_INTERVAL);
            newPoints.push(new Point(vector, point.id, point.mass));
        });
        this.points = newPoints;
    }
}

class Vector {

    constructor(x = 0, y = 0) {
        this.setCartesian(x, y);
    }

    get magnitude() {
        return Math.sqrt((this.x * this.x) + (this.y * this.y));
    }

    get direction() {
        return Math.atan2(this.y, this.x);
    }

    set magnitude(value) {
        this.setPolar(value, this.direction);
    }

    set direction(value) {
        this.setPolar(this.magnitude, value);
    }

    setCartesian(x, y) {
        this.x = x;
        this.y = y;
    }

    setPolar(magnitude, direction) {
        this.setCartesian(magnitude * Math.cos(direction), magnitude * Math.sin(direction));
    }

    static fromPolar(magnitude, direction) {
        let v = new Vector();
        v.setPolar(magnitude, direction);
        return v;
    }

    getInverse() {
        return Vector.fromPolar(-this.magnitude, this.direction);
    }

    getDistanceTo(vector) {
        return Math.sqrt(Math.pow(vector.x - this.x, 2) + Math.pow(vector.y - this.y, 2));
    }

    getDirectionTo(vector) {
        return Math.atan2(vector.y - this.y, vector.x - this.x);
    }

    add(vector) {
        return new Vector(this.x + vector.x, this.y + vector.y);
    }

    subtract(vector) {
        return this.add(vector.getInverse());
    }

    multiplyScalar(scalar) {
        let v = new Vector(this.x, this.y);
        v.magnitude *= scalar;
        return v;
    }

    divideScalar(scalar) {
        return this.multiplyScalar(1 / scalar);
    }
}