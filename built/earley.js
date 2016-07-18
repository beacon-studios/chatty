"use strict";
class EarleyTerminal {
    constructor(value) {
        this.value = value;
    }
    ;
    identify() {
        let val = this.value;
        if (typeof val === 'string') {
            return '"' + val + '"';
        }
        else if (val instanceof RegExp) {
            return val.toString();
        }
    }
    ;
    match(input) {
        let val = this.value;
        if (typeof val === 'string') {
            return input.substr(0, val.length) === val ? val : null;
        }
        else if (val instanceof RegExp) {
            let match = input.match(val);
            return match && match.index === 0 ? match[0] : null;
        }
    }
    ;
}
;
class EarleyRule {
    constructor(symbols) {
        this.symbols = symbols;
    }
    ;
}
;
class EarleyProductionLookup {
    constructor(name) {
        this.name = name;
    }
    ;
    identify() {
        return '<' + this.name + '>';
    }
    ;
}
;
class EarleyProduction {
    constructor(name, rules) {
        this.name = name;
        this.rules = [];
        if (Array.isArray(rules))
            this.add(...rules);
    }
    ;
    add(...rules) {
        for (let i = 0; i < rules.length; i++) {
            let rule = rules[i];
            rule.production = this;
            this.rules.push(rule);
        }
    }
    ;
    instantiate(start = 0, current = 0) {
        let items = this.rules.map((r) => new EarleyItem(r, start, current));
        return items;
    }
    ;
}
;
class EarleyItem {
    constructor(rule, start = 0, current = 0, length = 0) {
        this.rule = rule;
        this.start = start || 0;
        this.current = current || 0;
        this.length = length || 0;
    }
    ;
    next() {
        if (this.current >= this.rule.symbols.length) {
            return null;
        }
        return this.rule.symbols[this.current];
    }
    ;
    advance(new_length) {
        if (this.completed())
            throw new Error('cannot advance an item at the end of its rule');
        return new EarleyItem(this.rule, this.start, this.current + 1, new_length);
    }
    ;
    completed() {
        return this.current >= this.rule.symbols.length;
    }
    ;
    debug(debug_mode) {
        debug_mode = debug_mode || 'start';
        let msg = this.rule.production.name + ' ->';
        for (let k = 0; k < this.rule.symbols.length; k++) {
            let symbol = this.rule.symbols[k];
            if (k == this.current)
                msg += ' ●';
            msg += ' ' + symbol.identify();
        }
        if (this.current == this.rule.symbols.length) {
            msg += ' ●';
        }
        msg += ' (' + this[debug_mode] + ')';
        return msg;
    }
    ;
}
;
class EarleyStateSet {
    constructor() {
        this.items = [];
    }
    ;
    unshift(...items) {
        this.items.unshift(...items);
    }
    ;
    push(...items) {
        this.items.push(...items);
    }
    ;
}
;
class EarleyPushdown {
    constructor(debug_mode) {
        this.debug_mode = debug_mode || null;
        this.states = [];
    }
    get length() { return this.states.length; }
    ;
    get(index) {
        if (index < this.states.length) {
            return this.states[index];
        }
        else {
            while (index >= this.states.length) {
                let set = new EarleyStateSet;
                this.states.push(set);
            }
            return this.states[index];
        }
    }
    ;
    debug(state_index, item_index) {
        for (let i = 0; i < this.length; i++) {
            let state = this.get(i);
            console.log((state_index === i ? '> ' : '') + 'STATE ' + i + ' {');
            for (let j = 0; j < state.items.length; j++) {
                let item = state.items[j];
                let msg = '    ' + (state_index === i && item_index === j ? '> ' : '') + item.debug(this.debug_mode);
                console.log(msg);
            }
            console.log('}');
        }
    }
    ;
}
;
class SyntaxNode {
    constructor(type, tokens) {
        this._type = type;
        this._tokens = tokens;
    }
    ;
    type() {
        return this._type;
    }
    tokens() {
        return this._tokens;
    }
    ;
}
exports.SyntaxNode = SyntaxNode;
class EarleyProcessor {
    constructor(parser, source, states) {
        this.parser = parser;
        this.source = source;
        this.states = states;
    }
    ;
    completed() {
        return this.states.length == (this.source.length + 1) && this.states.get(this.source.length).items.some((i) => i.completed() && i.start === 0);
    }
    ;
    tree() {
        let indexed = new EarleyPushdown('length');
        for (let i = 0; i < this.states.length; i++) {
            let state = this.states.get(i);
            for (let j = 0; j < state.items.length; j++) {
                let item = state.items[j];
                if (item.completed()) {
                    indexed.get(item.start).unshift(item);
                }
            }
        }
        indexed.debug();
        return null;
    }
    ;
}
exports.EarleyProcessor = EarleyProcessor;
;
class EarleyParser {
    constructor() {
        this.productions = {};
        this.nodes = {};
    }
    ;
    production(name) {
        return new EarleyProductionLookup(name);
    }
    ;
    addRule(name, symbols) {
        let prod = this.productions[name];
        if (!prod) {
            prod = new EarleyProduction(name);
            this.productions[name] = prod;
        }
        let imported_symbols = [];
        for (let i = 0; i < symbols.length; i++) {
            let symbol = symbols[i];
            if (typeof symbol === 'string') {
                imported_symbols.push(new EarleyTerminal(symbol));
            }
            else if (symbol instanceof RegExp) {
                imported_symbols.push(new EarleyTerminal(symbol));
            }
            else if (symbol instanceof EarleyProductionLookup) {
                imported_symbols.push(symbol);
            }
        }
        prod.add(new EarleyRule(imported_symbols));
    }
    ;
    node(name) {
        if (name in this.nodes) {
            return this.nodes[name];
        }
        else {
            return SyntaxNode;
        }
    }
    ;
    addNode(name, nodeClass) {
        this.nodes[name] = nodeClass;
    }
    ;
    parse(firstProduction, source) {
        let states = new EarleyPushdown();
        if (firstProduction in this.productions) {
            states.get(0).push(...this.productions[firstProduction].instantiate(0, 0));
        }
        else {
            throw new Error('could not find production "' + firstProduction + '"');
        }
        let state_index = 0;
        while (state_index <= source.length) {
            if (state_index >= states.length)
                break;
            let state = states.get(state_index);
            let item_index = 0;
            while (item_index < state.items.length) {
                let item = state.items[item_index];
                let next = item.next();
                // completion
                if (next === null) {
                    console.log('completed rule ' + item.rule.production.name);
                    do {
                        let completion_state = states.get(item.start);
                        let addition_state = states.get(state_index);
                        for (let i = 0; i < completion_state.items.length; i++) {
                            let completion_item = completion_state.items[i];
                            let completion_next = completion_item.next();
                            if (completion_next instanceof EarleyProductionLookup && completion_next.name === item.rule.production.name) {
                                console.log('advanced ' + completion_item.rule.production.name);
                                addition_state.push(completion_item.advance(state_index));
                            }
                        }
                        break;
                    } while (1);
                }
                else if (next instanceof EarleyTerminal) {
                    console.log('scanning for ' + next.identify());
                    let match = next.match(source.substr(state_index));
                    if (match) {
                        states.get(state_index + 1).push(item.advance(state_index + 1));
                    }
                }
                else if (next instanceof EarleyProductionLookup) {
                    console.log('predicting for ' + next.identify());
                    let production = this.productions[next.name];
                    if (!production)
                        throw new Error('could not find production "' + next.name + '"');
                    // no duplication of productions
                    if (!state.items.some((item) => item.rule.production == production && item.start == state_index)) {
                        let instances = production.instantiate(state_index, 0);
                        instances.map((i) => console.log('adding to ' + state_index + ': ' + i.debug()));
                        state.push(...instances);
                    }
                }
                else {
                    throw new Error('invalid symbol found in rule');
                }
                states.debug(state_index, item_index);
                console.log('------------------------------');
                item_index++;
            }
            state_index++;
        }
        return new EarleyProcessor(this, source, states);
    }
    ;
}
exports.EarleyParser = EarleyParser;
;
//# sourceMappingURL=earley.js.map