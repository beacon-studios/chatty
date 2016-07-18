import {Parser, Node} from './api';
import {INode} from './interfaces';

interface IMathsNode extends INode {
    eval(): number;
};

let parser = new Parser();
let maths = parser.language<IMathsNode>('maths');
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



class NumberNode extends Node implements IMathsNode {
    private val: string;

    constructor(type: string, children: Array<INode|string>) {
        super(type, children);
        this.val = children.join();
    };

    eval(): number {
        return parseInt(this.val, 10);
    };
};

class SumNode extends Node implements IMathsNode {
    get length(): number { return this.first.length + this.operator.length + this.second.length; };

    constructor(private first: Node, private operator: string, private second: Node) {
        super('Sum', [first, operator, second]);
    };

    eval(): number {
        switch(this.operator) {
            case '+':
                return 1;

            case '-':
                return 0;
        }
    };
};

maths.nodes().attach('Sum', (children: Array<IMathsNode|string>): IMathsNode => {
    if(children.length === 3) {
        let first = children[0];
        let operator = children[1];
        let second = children[2];

        if(first instanceof Node && typeof operator === 'string' && second instanceof Node) {
            return new SumNode(first, operator, second);
        }

    } 

    return null;
});

//maths.nodes().attach('Number', (children: Array<INode|string>): INode => new NumberNode(children.join()));

let processor = maths.parse('1+(2*3-4)', 'Sum');
console.log(processor);
console.log(processor.eval());