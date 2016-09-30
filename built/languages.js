"use strict";
var earley_1 = require('./earley');
var NodeSet = (function () {
    function NodeSet() {
        this._nodes = {};
    }
    Object.defineProperty(NodeSet.prototype, "default", {
        get: function () { return this._default; },
        set: function (method) { this._default = method; },
        enumerable: true,
        configurable: true
    });
    ;
    ;
    Object.defineProperty(NodeSet.prototype, "terminal", {
        get: function () { return this._terminal; },
        set: function (method) { this._terminal = method; },
        enumerable: true,
        configurable: true
    });
    ;
    ;
    ;
    NodeSet.prototype.get = function (type) {
        return (type in this._nodes) ? this._nodes[type] : null;
    };
    ;
    NodeSet.prototype.attach = function (types, node) {
        if (typeof types === 'string') {
            this._nodes[types] = node;
        }
        else {
            for (var _i = 0, types_1 = types; _i < types_1.length; _i++) {
                var type = types_1[_i];
                this._nodes[type] = node;
            }
        }
    };
    ;
    NodeSet.prototype.lookup = function () {
        return this._nodes;
    };
    return NodeSet;
}());
exports.NodeSet = NodeSet;
;
var ProductionReference = (function () {
    function ProductionReference(name) {
        this._name = name;
    }
    Object.defineProperty(ProductionReference.prototype, "name", {
        get: function () { return this._name; },
        enumerable: true,
        configurable: true
    });
    ;
    ;
    ProductionReference.prototype.identify = function () {
        return '<' + this.name + '>';
    };
    ;
    return ProductionReference;
}());
exports.ProductionReference = ProductionReference;
;
var Rule = (function () {
    function Rule() {
    }
    return Rule;
}());
exports.Rule = Rule;
;
var Production = (function () {
    function Production(name) {
        this._name = name;
        this._rules = [];
    }
    Object.defineProperty(Production.prototype, "name", {
        get: function () { return this._name; },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(Production.prototype, "rules", {
        get: function () { return this._rules; },
        enumerable: true,
        configurable: true
    });
    ;
    ;
    Production.prototype.push = function () {
        var rules = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            rules[_i - 0] = arguments[_i];
        }
        (_a = this._rules).push.apply(_a, rules);
        return this;
        var _a;
    };
    ;
    return Production;
}());
exports.Production = Production;
;
var ProductionSet = (function () {
    function ProductionSet() {
        this._productions = {};
    }
    ;
    ProductionSet.prototype.push = function (production) {
        if (production.name in this._productions) {
            (_a = this._productions[production.name]).push.apply(_a, production.rules);
        }
        else {
            this._productions[production.name] = production;
        }
        return this;
        var _a;
    };
    ;
    ProductionSet.prototype.all = function () {
        var _this = this;
        return Object.keys(this._productions).map(function (k) { return _this._productions[k]; });
    };
    ;
    return ProductionSet;
}());
exports.ProductionSet = ProductionSet;
;
var Feature = (function () {
    function Feature(name, productions, nodes) {
        this._name = name;
        this._productions = productions;
        this._nodes = nodes;
    }
    Object.defineProperty(Feature.prototype, "name", {
        get: function () { return this._name; },
        enumerable: true,
        configurable: true
    });
    ;
    ;
    Feature.prototype.productions = function () {
        return this._productions;
    };
    ;
    Feature.prototype.nodes = function () {
        return this._nodes;
    };
    ;
    return Feature;
}());
exports.Feature = Feature;
;
var FeatureSet = (function () {
    function FeatureSet() {
        this._features = {};
    }
    ;
    FeatureSet.prototype.push = function (feature) {
        this._features[feature.name] = feature;
    };
    ;
    FeatureSet.prototype.all = function () {
        var _this = this;
        return Object.keys(this._features).map(function (k) { return _this._features[k]; });
    };
    ;
    return FeatureSet;
}());
exports.FeatureSet = FeatureSet;
;
var Parse = (function () {
    function Parse(parser, processor) {
        this._parser = parser;
        this._processor = processor;
    }
    ;
    Parse.prototype.completed = function () {
        return this._processor.completed();
    };
    ;
    Parse.prototype.tree = function () {
        var nodes = this._parser.nodes();
        var def = nodes.default || function (type, children) {
            var types = children.map(function (child) { return 'name' in child.constructor ? child.constructor['name'] : '<anonymous>'; });
            throw new Error('could not create node of type "' + type + '" with ' + children.length + ' children of types: ' + types);
        };
        var walk = function (type, children) {
            var factory = nodes.get(type);
            if (factory) {
                return factory(children) || def(type, children);
            }
            else {
                return def(type, children);
            }
        };
        return this._processor.tree(walk, nodes.terminal);
    };
    ;
    return Parse;
}());
exports.Parse = Parse;
;
var Language = (function () {
    function Language(name, productions, nodes, features) {
        this._name = name;
        this._productions = productions;
        this._nodes = nodes;
        this._features = features;
    }
    ;
    Language.prototype.ref = function (name) {
        return new ProductionReference(name);
    };
    ;
    Language.prototype.production = function (name) {
        var production = new Production(name);
        this.productions().push(production);
        return production;
    };
    ;
    Language.prototype.productions = function () {
        return this._productions;
    };
    ;
    Language.prototype.nodes = function () {
        return this._nodes;
    };
    ;
    Language.prototype.parse = function (source, entrypoint) {
        var parser = new earley_1.EarleyParser();
        for (var _i = 0, _a = this._productions.all(); _i < _a.length; _i++) {
            var production = _a[_i];
            for (var _b = 0, _c = production.rules; _b < _c.length; _b++) {
                var rule = _c[_b];
                parser.addRule(production.name, rule);
            }
        }
        var processor = parser.parse(entrypoint, source);
        return new Parse(this, processor);
    };
    ;
    return Language;
}());
exports.Language = Language;
;
//# sourceMappingURL=languages.js.map