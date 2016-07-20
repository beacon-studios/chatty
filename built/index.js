var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", './api'], function (require, exports, api_1) {
    "use strict";
    var colors = require('colors/safe');
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
    ;
    var MathsTerminalNode = (function (_super) {
        __extends(MathsTerminalNode, _super);
        function MathsTerminalNode() {
            _super.apply(this, arguments);
        }
        MathsTerminalNode.prototype.eval = function () {
            var val = this.toString();
            if (val.match(/^[0-9]+$/)) {
                return parseInt(val, 10);
            }
            else {
                throw new Error('terminal "' + val + '" cannot be evaluated');
            }
        };
        ;
        return MathsTerminalNode;
    }(api_1.TerminalNode));
    ;
    var OperatorNode = (function (_super) {
        __extends(OperatorNode, _super);
        function OperatorNode(first, operator, second) {
            _super.call(this, 'Operator', [first, operator, second]);
            this._first = first;
            this._operator = operator;
            this._second = second;
        }
        Object.defineProperty(OperatorNode.prototype, "first", {
            get: function () { return this._first; },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(OperatorNode.prototype, "operator", {
            get: function () { return this._operator; },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(OperatorNode.prototype, "second", {
            get: function () { return this._second; },
            enumerable: true,
            configurable: true
        });
        ;
        ;
        OperatorNode.prototype.eval = function () {
            switch (this._operator.toString()) {
                case '+': return this._first.eval() + this._second.eval();
                case '-': return this._first.eval() - this._second.eval();
                case '*': return this._first.eval() * this._second.eval();
                case '/': return this._first.eval() / this._second.eval();
            }
        };
        ;
        return OperatorNode;
    }(api_1.Node));
    ;
    var FactorNode = (function (_super) {
        __extends(FactorNode, _super);
        function FactorNode(children) {
            _super.call(this, 'Factor', children);
            if (children.length === 3) {
                this._bracketed = true;
                this._subject = children[1];
            }
            else {
                this._bracketed = false;
                this._subject = children[0];
            }
        }
        Object.defineProperty(FactorNode.prototype, "bracketed", {
            get: function () { return this._bracketed; },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(FactorNode.prototype, "subject", {
            get: function () { return this._subject; },
            enumerable: true,
            configurable: true
        });
        ;
        ;
        FactorNode.prototype.eval = function () {
            return this._subject.eval();
        };
        ;
        return FactorNode;
    }(api_1.Node));
    ;
    maths.nodes().terminal = function (value) {
        return new MathsTerminalNode(value);
    };
    maths.nodes().attach('Sum', function (children) {
        if (children.length === 3) {
            var operator = children[1];
            if (operator instanceof MathsTerminalNode) {
                return new OperatorNode(children[0], operator, children[2]);
            }
        }
        else if (children.length === 1) {
            return new FactorNode(children);
        }
    });
    maths.nodes().attach('Product', function (children) {
        if (children.length === 3) {
            var operator = children[1];
            if (operator instanceof MathsTerminalNode) {
                return new OperatorNode(children[0], operator, children[2]);
            }
        }
        else if (children.length === 1) {
            return new FactorNode(children);
        }
    });
    maths.nodes().attach('Factor', function (children) {
        return new FactorNode(children);
    });
    maths.nodes().attach('Number', function (children) {
        return new MathsTerminalNode(children.map(function (child) { return child.toString(); }).join());
    });
    var tree = maths.parse('1+(2*3)-4', 'Sum').tree();
    console.log(tree);
    console.log(tree.toString() + ' = ' + tree.eval());
    var formatter = parser.formatter('maths');
    formatter.on('Operator', function (instance, format) {
        return format(instance.first) + ' ' + colors.yellow(instance.operator) + ' ' + format(instance.second);
    });
    formatter.on('Factor', function (instance, format) {
        return instance.bracketed ? (colors.cyan('(') + format(instance.subject) + colors.cyan(')')) : colors.white(format(instance.subject));
    });
    var time = (new Date).getTime();
    console.log(formatter.format(tree));
    console.log('took ' + ((new Date).getTime() - time));
});
/*
STATE 0 {
    Sum -> <Sum> /^[+-]/ <Product> ● (7)
    Sum -> <Sum> /^[+-]/ <Product> ● (5)
    Sum -> <Sum>✔ /^[+-]/✔ <Product> ● (3)
    Sum -> <Product>✔ ● (1)
    Product -> <Factor>✔ ● (1)
    Factor -> <Number>✔ ● (1)
    Number -> /^[0-9]/✔ ● (1)
}
STATE 1 {
}
STATE 2 {
    Product -> <Product> /^[*\/]/ <Factor> ● (5)
    Product -> <Factor> ● (3)
    Factor -> <Number> ● (3)
    Number -> /^[0-9]/ ● (3)
}
STATE 3 {
}
STATE 4 {
    Factor -> <Number> ● (5)
    Number -> /^[0-9]/ ● (5)
}
STATE 5 {
}
STATE 6 {
    Product -> <Factor> ● (7)
    Factor -> <Number> ● (7)
    Number -> /^[0-9]/ ● (7)
}

    !! Sum -> <Sum> /^[+-]/ <Product> ● (7)
        [1+2*3-4] Sum -> <Sum> /^[+-]/ <Product> ● (5)
            [1+2*3] Sum -> <Sum> /^[+-]/ <Product> ● (3)
                [1] Sum -> <Product> ● (1)
                    [1] Product -> <Factor> ● (1)
                        [1] Factor -> <Number> ● (1)
                            [1] Number -> /^[0-9]/ ● (1)
                            
                [+] +
                [2*3] Product -> <Product> /^[*\/]/ <Factor> ● (5)
                    [2] Product -> <Factor> ● (3)
                        [2] Factor -> <Number> ● (3)
                            [2] Number -> /^[0-9]/ ● (3)
                    [*] *
                    [3] Factor -> <Number> ● (5)
                        [3] Number -> /^[0-9]/ ● (5)

            [-] -
            [4] Product -> <Factor> ● (7)
                [4] Factor -> <Number> ● (7)
                    [4] Number -> /^[0-9]/ ● (7)
*/ 
//# sourceMappingURL=index.js.map