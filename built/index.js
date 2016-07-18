"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var api_1 = require('./api');
;
var parser = new api_1.Parser();
var maths = parser.language('maths');
maths.production('Sum')
    .push([maths.ref('Sum'), /^[+-]/, maths.ref('Product')])
    .push([maths.ref('Product')]);
maths.production('Product')
    .push([maths.ref('Product'), /^[*\/]/, maths.ref('Factor')])
    .push([maths.ref('Factor')]);
maths.production('Factor')
    .push(['(', maths.ref('Sum'), ')'])
    .push([maths.ref('Number')]);
maths.production('Number')
    .push([/^[0-9]/, maths.ref('Number')])
    .push([/^[0-9]/]);
var NumberNode = (function (_super) {
    __extends(NumberNode, _super);
    function NumberNode(type, children) {
        _super.call(this, type, children);
        this.val = children.join();
    }
    ;
    NumberNode.prototype.eval = function () {
        return parseInt(this.val, 10);
    };
    ;
    return NumberNode;
}(api_1.Node));
;
var SumNode = (function (_super) {
    __extends(SumNode, _super);
    function SumNode(first, operator, second) {
        _super.call(this, 'Sum', [first, operator, second]);
        this.first = first;
        this.operator = operator;
        this.second = second;
    }
    Object.defineProperty(SumNode.prototype, "length", {
        get: function () { return this.first.length + this.operator.length + this.second.length; },
        enumerable: true,
        configurable: true
    });
    ;
    ;
    SumNode.prototype.eval = function () {
        switch (this.operator) {
            case '+':
                return 1;
            case '-':
                return 0;
        }
    };
    ;
    return SumNode;
}(api_1.Node));
;
maths.nodes().attach('Sum', function (children) {
    if (children.length === 3) {
        var first = children[0];
        var operator = children[1];
        var second = children[2];
        if (first instanceof api_1.Node && typeof operator === 'string' && second instanceof api_1.Node) {
            return new SumNode(first, operator, second);
        }
    }
    return null;
});
//maths.nodes().attach('Number', (children: Array<INode|string>): INode => new NumberNode(children.join()));
var processor = maths.parse('1+(2*3-4)', 'Sum');
console.log(processor);
console.log(processor.eval());
//# sourceMappingURL=index.js.map