"use strict";
var languages_1 = require('./languages');
var Parser = (function () {
    function Parser() {
        this._languages = {};
    }
    ;
    Parser.prototype.language = function (name) {
        var language = new languages_1.Language(name, new languages_1.ProductionSet(), new languages_1.NodeSet(), new languages_1.FeatureSet());
        this._languages[name] = language;
        return language;
    };
    ;
    return Parser;
}());
exports.Parser = Parser;
;
;
var TerminalNode = (function () {
    function TerminalNode(value) {
        this._value = value;
    }
    Object.defineProperty(TerminalNode.prototype, "type", {
        get: function () { return 'TERMINAL'; },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(TerminalNode.prototype, "children", {
        get: function () { return []; },
        enumerable: true,
        configurable: true
    });
    ;
    ;
    TerminalNode.prototype.toString = function () {
        return this._value;
    };
    ;
    return TerminalNode;
}());
exports.TerminalNode = TerminalNode;
;
var Node = (function () {
    function Node(type, children) {
        this._type = type;
        this._children = children;
    }
    Object.defineProperty(Node.prototype, "type", {
        get: function () { return this._type; },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(Node.prototype, "children", {
        get: function () { return this._children; },
        enumerable: true,
        configurable: true
    });
    ;
    ;
    Node.prototype.toString = function () {
        return this._children.map(function (child) { return child.toString(); }).join();
    };
    ;
    return Node;
}());
exports.Node = Node;
;
//# sourceMappingURL=api.js.map