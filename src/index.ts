import {Parser, TerminalNode, Node} from './api';
import {INode, IVisitor} from './interfaces';
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

/*
maths.nodes().attach('Sum', (children: INode[]) => {
  if(children.length === 3) {
    return [children[0], children[1]];

  } else if(children.length === 1) {
    return children;
  }
});

maths.nodes().attach('Product', (children: INode[]) => {
  if(children.length === 3) {
    return [children[0], children[2]];

  } else {
    return children;
  }
});

maths.nodes().attach('Factor', (children: INode[]) => {
  if(children.length === 3) {
    return [children[1]];

  } else {
    return children;
  }
});
*/


let tree = maths.parse('1+(2*3)-4', 'Sum').tree();
console.log(tree);
//console.log(tree.toString() + ' = ' + tree.eval());

/*let formatter = parser.formatter<IMathsNode>('maths');
formatter.on('Operator', (instance: OperatorNode, format: (instance: IMathsNode) => string): string => {
    return format(instance.first) + ' ' + colors.yellow(instance.operator) + ' ' + format(instance.second);
});
formatter.on('Factor', (instance: FactorNode, format: (instance: IMathsNode) => string): string => {
    return instance.bracketed ? (colors.cyan('(') + format(instance.subject) + colors.cyan(')')) : colors.white(format(instance.subject));
});

let time = (new Date).getTime();
console.log(formatter.format(tree));
console.log('took ' + ((new Date).getTime() - time));
*/
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
