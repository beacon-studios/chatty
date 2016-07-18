"use strict";
const earley_1 = require('./earley');
let parser = new earley_1.EarleyParser();
parser.addRule('Sum', [parser.production('Sum'), /^[+-]/, parser.production('Product')]);
parser.addRule('Sum', [parser.production('Product')]);
parser.addRule('Product', [parser.production('Product'), /^[*\/]/, parser.production('Factor')]);
parser.addRule('Product', [parser.production('Factor')]);
parser.addRule('Factor', ['(', parser.production('Sum'), ')']);
parser.addRule('Factor', [parser.production('Number')]);
parser.addRule('Number', [/^[0-9]/, parser.production('Number')]);
parser.addRule('Number', [/^[0-9]/]);
let processor = parser.parse('Sum', '1+(2*3-4)');
console.log(processor.completed());
//# sourceMappingURL=index.js.map