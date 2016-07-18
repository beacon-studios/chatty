"use strict";
var languages_1 = require('./languages');
var languages_2 = require('./languages');
exports.Node = languages_2.Node;
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
//# sourceMappingURL=api.js.map