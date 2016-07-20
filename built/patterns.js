define(["require", "exports"], function (require, exports) {
    "use strict";
    ;
    var Formatter = (function () {
        function Formatter(language) {
            this._language = language;
            this._matchers = {};
        }
        ;
        Formatter.prototype.on = function (types, method) {
            if (typeof types === 'string') {
                this._matchers[types] = method;
            }
            else {
                for (var _i = 0, types_1 = types; _i < types_1.length; _i++) {
                    var type = types_1[_i];
                    this._matchers[type] = method;
                }
            }
        };
        ;
        Formatter.prototype.format = function (tree) {
            var _this = this;
            var formatInstance = function (instance) {
                if (instance.type in _this._matchers) {
                    return _this._matchers[instance.type](instance, _this.format.bind(_this));
                }
                else {
                    return instance.toString();
                }
            };
            return formatInstance(tree);
        };
        ;
        return Formatter;
    }());
    exports.Formatter = Formatter;
    ;
});
//# sourceMappingURL=patterns.js.map