"use strict";

let api = require('../built/api.js');

describe('Languages', () => {
    let lang;

    beforeEach(() => {
        let parser = new api.Parser();
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
    });

});