module.exports = Errors;

function Errors(hatch){
    var proto = this.__proto__;
    this.hatch = hatch;

    Object.keys(proto).forEach(function(e) {
        proto[e].prototype.__proto__ = Error.prototype;
    })
}

Errors.prototype.NotFound = function NotFound(req, message) {
    if (!(this instanceof NotFound)) return new NotFound(req, message)

    this.name = 'Not Found';
    this.code = 404;

    if (typeof req === 'string') message = req;

    Error.call(this, message || this.name);
};

Errors.prototype.InternalError = function InternalError(message) {
    if (!(this instanceof InternalError)) return new InternalError(message)

    this.name = 'Application Error';
    this.code = 500;
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
};

Errors.prototype.Forbidden = function Forbidden(message) {
    if (!(this instanceof Forbidden)) return new Forbidden(message)

    this.name = 'Forbidden';
    this.code = 403;
    Error.call(this, message);
};

Errors.prototype.WidgetError = function WidgetError(message) {
    if (!(this instanceof WidgetError)) return new WidgetError(message)

    this.name = 'Widget error';
    this.code = 503;
    Error.call(this, message);
};
