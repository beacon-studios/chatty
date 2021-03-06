import {Parser, INode, TerminalNode, Node} from './api';
import {Formatter} from './patterns';

declare var require: any;
let colors = require('colors/safe');

let parser = new Parser();
let maths = parser.language('maths');
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


interface IMathsNode extends INode {
    eval(): number;
};

class MathsTerminalNode extends TerminalNode implements IMathsNode {
    eval(): number {
        let val = this.toString();
        if(val.match(/^[0-9]+$/)) {
            return parseInt(val, 10);

        } else {
            throw new Error('terminal "' + val + '" cannot be evaluated');
        }
    };
};

class OperatorNode extends Node implements IMathsNode {
    private _first: IMathsNode;
    private _operator: MathsTerminalNode;
    private _second: IMathsNode;
    get first() { return this._first; };
    get operator() { return this._operator; };
    get second() { return this._second; };

    constructor(first: IMathsNode, operator: MathsTerminalNode, second: IMathsNode) {
        super('Operator', [first, operator, second]);
        this._first = first;
        this._operator = operator;
        this._second = second;
    };

    eval(): number {
        switch(this._operator.toString()) {
            case '+': return this._first.eval() + this._second.eval();
            case '-': return this._first.eval() - this._second.eval();
            case '*': return this._first.eval() * this._second.eval();
            case '/': return this._first.eval() / this._second.eval();
        }
    };
};

class FactorNode extends Node implements IMathsNode {
    private _bracketed: boolean;
    private _subject: IMathsNode;
    get bracketed() { return this._bracketed; };
    get subject() { return this._subject; };

    constructor(children: Array<IMathsNode>) {
        super('Factor', children);

        if(children.length === 3) {
            this._bracketed = true;
            this._subject = children[1];

        } else {
            this._bracketed = false;
            this._subject = children[0];
        }
    };

    eval(): number {
        return this._subject.eval();
    };

};
maths.nodes().terminal = (value: string): IMathsNode => {
    return new MathsTerminalNode(value);
};

maths.nodes().attach('Sum', (children: IMathsNode[]): IMathsNode => {
    if(children.length === 3) {
        let operator = children[1];

        if(operator instanceof MathsTerminalNode) {
            return new OperatorNode(children[0], operator, children[2]);
        }

    } else if(children.length === 1) {
        return new FactorNode(children);
    }
});

maths.nodes().attach('Product', (children: IMathsNode[]): IMathsNode => {
    if(children.length === 3) {
        let operator = children[1];

        if(operator instanceof MathsTerminalNode) {
            return new OperatorNode(children[0], operator, children[2]);
        }

    } else if(children.length === 1) {
        return new FactorNode(children);
    }
});

maths.nodes().attach('Factor', (children: IMathsNode[]): IMathsNode => {
    return new FactorNode(children);
});

maths.nodes().attach('Number', (children: IMathsNode[]): IMathsNode => {
    return new MathsTerminalNode(children.map((child) => child.toString()).join());
});

let tree = maths.parse('1+(2*3)-4', 'Sum').tree();
console.log(tree);
console.log(tree.toString() + ' = ' + tree.eval());

let formatter = parser.formatter<IMathsNode>('maths');
formatter.on('Operator', (instance: OperatorNode, format: (instance: IMathsNode) => string): string => {
    return format(instance.first) + ' ' + colors.yellow(instance.operator) + ' ' + format(instance.second);
});
formatter.on('Factor', (instance: FactorNode, format: (instance: IMathsNode) => string): string => {
    return instance.bracketed ? (colors.cyan('(') + format(instance.subject) + colors.cyan(')')) : colors.white(format(instance.subject));
});

let time = (new Date).getTime();
console.log(formatter.format(tree));
console.log('took ' + ((new Date).getTime() - time));

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