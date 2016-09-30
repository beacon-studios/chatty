"use strict";
function isProductionReference(ref) {
    return typeof ref === 'object' && typeof ref.name === 'string' && typeof ref.identify === 'function';
}
;
var EarleyTerminal = (function () {
    function EarleyTerminal(value) {
        this.value = value;
    }
    ;
    EarleyTerminal.prototype.identify = function () {
        var val = this.value;
        if (typeof val === 'string') {
            return '"' + val + '"';
        }
        else if (val instanceof RegExp) {
            return val.toString();
        }
    };
    ;
    EarleyTerminal.prototype.match = function (input) {
        var val = this.value;
        if (typeof val === 'string') {
            return input.substr(0, val.length) === val ? val : null;
        }
        else if (val instanceof RegExp) {
            var match = input.match(val);
            return match && match.index === 0 ? match[0] : null;
        }
    };
    ;
    return EarleyTerminal;
}());
;
var EarleyRule = (function () {
    function EarleyRule(symbols) {
        this.symbols = symbols;
    }
    ;
    return EarleyRule;
}());
;
var EarleyProduction = (function () {
    function EarleyProduction(name, rules) {
        this.name = name;
        this.rules = [];
        if (Array.isArray(rules))
            this.add.apply(this, rules);
    }
    ;
    EarleyProduction.prototype.add = function () {
        var rules = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            rules[_i - 0] = arguments[_i];
        }
        for (var i = 0; i < rules.length; i++) {
            var rule = rules[i];
            rule.production = this;
            this.rules.push(rule);
        }
    };
    ;
    EarleyProduction.prototype.instantiate = function (start, current) {
        if (start === void 0) { start = 0; }
        if (current === void 0) { current = 0; }
        var items = this.rules.map(function (r) { return new EarleyItem(r, start, current); });
        return items;
    };
    ;
    return EarleyProduction;
}());
;
var EarleyItem = (function () {
    function EarleyItem(rule, start, current, length) {
        if (start === void 0) { start = 0; }
        if (current === void 0) { current = 0; }
        if (length === void 0) { length = 0; }
        this.rule = rule;
        this.start = start || 0;
        this.current = current || 0;
        this.length = length || 0;
    }
    ;
    EarleyItem.prototype.next = function () {
        if (this.current >= this.rule.symbols.length) {
            return null;
        }
        return this.rule.symbols[this.current];
    };
    ;
    EarleyItem.prototype.advance = function (new_length) {
        if (this.completed())
            throw new Error('cannot advance an item at the end of its rule');
        return new EarleyItem(this.rule, this.start, this.current + 1, new_length);
    };
    ;
    EarleyItem.prototype.completed = function () {
        return this.current >= this.rule.symbols.length;
    };
    ;
    EarleyItem.prototype.debug = function (debug_mode) {
        debug_mode = debug_mode || 'start';
        var msg = this.rule.production.name + ' ->';
        for (var k = 0; k < this.rule.symbols.length; k++) {
            var symbol = this.rule.symbols[k];
            if (k == this.current)
                msg += ' ●';
            msg += ' ' + symbol.identify();
        }
        if (this.current == this.rule.symbols.length) {
            msg += ' ●';
        }
        msg += ' (' + this[debug_mode] + ')';
        return msg;
    };
    ;
    return EarleyItem;
}());
;
var EarleyStateSet = (function () {
    function EarleyStateSet() {
        this.items = [];
    }
    ;
    EarleyStateSet.prototype.unshift = function () {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i - 0] = arguments[_i];
        }
        (_a = this.items).unshift.apply(_a, items);
        var _a;
    };
    ;
    EarleyStateSet.prototype.push = function () {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i - 0] = arguments[_i];
        }
        (_a = this.items).push.apply(_a, items);
        var _a;
    };
    ;
    return EarleyStateSet;
}());
;
var EarleyPushdown = (function () {
    function EarleyPushdown(debug_mode) {
        this.debug_mode = debug_mode || null;
        this.states = [];
    }
    Object.defineProperty(EarleyPushdown.prototype, "length", {
        get: function () { return this.states.length; },
        enumerable: true,
        configurable: true
    });
    ;
    EarleyPushdown.prototype.get = function (index) {
        if (index < this.states.length) {
            return this.states[index];
        }
        else {
            while (index >= this.states.length) {
                var set = new EarleyStateSet;
                this.states.push(set);
            }
            return this.states[index];
        }
    };
    ;
    EarleyPushdown.prototype.debug = function (state_index, item_index) {
        for (var i = 0; i < this.length; i++) {
            var state = this.get(i);
            console.log((state_index === i ? '> ' : '') + 'STATE ' + i + ' {');
            for (var j = 0; j < state.items.length; j++) {
                var item = state.items[j];
                var msg = '    ' + (state_index === i && item_index === j ? '> ' : '') + item.debug(this.debug_mode);
                console.log(msg);
            }
            console.log('}');
        }
    };
    ;
    return EarleyPushdown;
}());
;
var EarleyProcessor = (function () {
    function EarleyProcessor(source, states) {
        this.source = source;
        this.states = states;
    }
    ;
    EarleyProcessor.prototype.completed = function () {
        return this.solutions().length > 0;
    };
    ;
    EarleyProcessor.prototype.solutions = function () {
        return this.states.get(this.source.length).items.filter(function (i) { return i.completed() && i.start === 0; });
    };
    ;
    EarleyProcessor.prototype.ambiguous = function () {
        return this.solutions().length > 1;
    };
    ;
    EarleyProcessor.prototype.tree = function (walker, terminal) {
        var indexed = new EarleyPushdown('length');
        for (var i = this.states.length - 1; i >= 0; i--) {
            var state = this.states.get(i);
            for (var j = state.items.length - 1; j >= 0; j--) {
                var item = state.items[j];
                if (item.completed()) {
                    indexed.get(item.start).push(item);
                }
            }
        }
        var self = this;
        var ret = (function CreateNode(state_index, item_index, depth) {
            var state = indexed.get(state_index);
            for (; item_index < state.items.length; item_index++) {
                var item = state.items[item_index];
                var tokens = [];
                var p = function (msg, depth) { console.log(Array(depth + 1).join('  ') + '[' + state_index + ':' + item_index + '] ' + msg); };
                p('running ' + item.debug('length'), depth);
                if (!item)
                    return null;
                for (var j = 0; j < item.rule.symbols.length; j++) {
                    var symbol = item.rule.symbols[j];
                    if (symbol instanceof EarleyTerminal) {
                        var token = symbol.match(self.source.substr(state_index));
                        if (token) {
                            p('found token "' + token + '" for ' + item.debug('length') + ' at ' + state_index, depth + 1);
                            state_index += token.length;
                            tokens.push(terminal(token));
                            continue;
                        }
                        else {
                            p('!NO token "' + symbol.identify() + '" for ' + item.debug('length') + ' at ' + state_index, depth + 1);
                            return null;
                        }
                    }
                    else if (isProductionReference(symbol)) {
                        var new_index = (state_index == item.start ? item_index + 1 : 0);
                        var state_1 = indexed.get(state_index);
                        var ret_1 = CreateNode(state_index, new_index, depth + 1);
                        if (ret_1) {
                            tokens.push(ret_1.token);
                            state_index = ret_1.length;
                            continue;
                        }
                        else {
                            p('!NO ' + symbol.identify() + ' for ' + item.debug('length') + ' at ' + state_index, depth);
                            return null;
                        }
                    }
                }
                return { token: walker(item.rule.production.name, tokens), length: state_index };
            }
            return null;
        })(0, 0, 0);
        if (ret) {
            return ret.token;
        }
        else {
            return null;
        }
    };
    ;
    return EarleyProcessor;
}());
exports.EarleyProcessor = EarleyProcessor;
;
var EarleyParser = (function () {
    function EarleyParser() {
        this.productions = {};
    }
    ;
    EarleyParser.prototype.addRule = function (name, symbols) {
        var prod = this.productions[name];
        if (!prod) {
            prod = new EarleyProduction(name);
            this.productions[name] = prod;
        }
        var imported_symbols = [];
        for (var i = 0; i < symbols.length; i++) {
            var symbol = symbols[i];
            if (typeof symbol === 'string') {
                imported_symbols.push(new EarleyTerminal(symbol));
            }
            else if (symbol instanceof RegExp) {
                imported_symbols.push(new EarleyTerminal(symbol));
            }
            else if (isProductionReference(symbol)) {
                imported_symbols.push(symbol);
            }
        }
        prod.add(new EarleyRule(imported_symbols));
    };
    ;
    EarleyParser.prototype.parse = function (firstProduction, source) {
        var states = new EarleyPushdown();
        if (firstProduction in this.productions) {
            (_a = states.get(0)).push.apply(_a, this.productions[firstProduction].instantiate(0, 0));
        }
        else {
            throw new Error('could not find production "' + firstProduction + '"');
        }
        var state_index = 0;
        while (state_index <= source.length) {
            if (state_index >= states.length)
                break;
            var state = states.get(state_index);
            var item_index = 0;
            var _loop_1 = function() {
                var item = state.items[item_index];
                var next = item.next();
                if (next === null) {
                    var completion_state = states.get(item.start);
                    var addition_state = states.get(state_index);
                    for (var i = 0; i < completion_state.items.length; i++) {
                        var completion_item = completion_state.items[i];
                        var completion_next = completion_item.next();
                        if (isProductionReference(completion_next) && completion_next.name === item.rule.production.name) {
                            addition_state.push(completion_item.advance(state_index));
                        }
                    }
                }
                else if (next instanceof EarleyTerminal) {
                    var match = next.match(source.substr(state_index));
                    if (match) {
                        states.get(state_index + 1).push(item.advance(state_index + 1));
                    }
                }
                else if (isProductionReference(next)) {
                    var production_1 = this_1.productions[next.name];
                    if (!production_1)
                        throw new Error('could not find production "' + next.name + '"');
                    if (!state.items.some(function (item) { return item.rule.production == production_1 && item.start == state_index; })) {
                        var instances = production_1.instantiate(state_index, 0);
                        state.push.apply(state, instances);
                    }
                }
                else {
                    throw new Error('invalid symbol found in rule');
                }
                item_index++;
            };
            var this_1 = this;
            while (item_index < state.items.length) {
                _loop_1();
            }
            state_index++;
        }
        return new EarleyProcessor(source, states);
        var _a;
    };
    ;
    return EarleyParser;
}());
exports.EarleyParser = EarleyParser;
;
//# sourceMappingURL=earley.js.map