import {INode, IProductionReference} from './interfaces';

function isProductionReference(ref: IProductionReference|any): ref is IProductionReference {
    return typeof ref.name === 'string' && typeof ref.identify === 'function';
}; 

class EarleyTerminal {
	public value: string|RegExp;

	constructor(value: string|RegExp) {
		this.value = value;
	};

	identify(): string {
		let val = this.value;
		if(typeof val === 'string') {
			return '"' + val + '"';

		} else if(val instanceof RegExp) {
			return val.toString();
		}
	};

	match(input: string): string {
		let val = this.value;

		if(typeof val === 'string') {
			return input.substr(0, val.length) === val ? val : null;

		} else if(val instanceof RegExp) {
			let match = input.match(val);
			return match && match.index === 0 ? match[0] : null;
		}
	};
};

class EarleyRule {
	public production: EarleyProduction;
	public symbols: Array<EarleyTerminal|IProductionReference>;

	constructor(symbols: Array<EarleyTerminal|IProductionReference>) {
		this.symbols = symbols;
	};
};

class EarleyProduction {
	public name: string;
	public rules: EarleyRule[];

	constructor(name: string, rules?: EarleyRule[]) {
		this.name = name;
		this.rules = [];

		if(Array.isArray(rules)) this.add(...rules);
	};

	public add(...rules: EarleyRule[]) {
		for(let i = 0; i < rules.length; i++) {
			let rule = rules[i];
			rule.production = this;
			this.rules.push(rule);
		}
	};

	instantiate(start: number = 0, current: number = 0) {
		let items: EarleyItem[] = this.rules.map((r) => new EarleyItem(r, start, current));
		return items;
	};
};

class EarleyItem {
	public rule: EarleyRule;
	public start: number;
	public current: number;
	public length: number;

	constructor(rule: EarleyRule, start: number = 0, current: number = 0, length: number = 0) {
		this.rule = rule;
		this.start = start || 0;
		this.current = current || 0;
		this.length = length || 0;
    };

	public next(): EarleyTerminal|IProductionReference {
		if(this.current >= this.rule.symbols.length) {
			return null;
		}

		return this.rule.symbols[this.current];
	};

	public advance(new_length: number): EarleyItem {
		if(this.completed()) throw new Error('cannot advance an item at the end of its rule');
		return new EarleyItem(this.rule, this.start, this.current + 1, new_length);
	};

	public completed(): Boolean {
		return this.current >= this.rule.symbols.length;
	};

	public debug(debug_mode?: string): string {
		debug_mode = debug_mode || 'start';
		let msg = this.rule.production.name + ' ->';
		
		for(let k = 0; k < this.rule.symbols.length; k++) {
			let symbol = this.rule.symbols[k];
			if(k == this.current) msg += ' ●';
			msg += ' ' + symbol.identify();
		}

		if(this.current == this.rule.symbols.length) {
			msg += ' ●';
		}

		msg += ' (' + this[debug_mode] + ')';

		return msg;
	};
};

class EarleyStateSet {
	public items: EarleyItem[];

	constructor() {
		this.items = [];
	};

	public unshift(...items: EarleyItem[]) {
		this.items.unshift(...items);
	};

	public push(...items: EarleyItem[]) {
		this.items.push(...items);
	};
};

class EarleyPushdown {
	private states: EarleyStateSet[];
	private debug_mode: string;

	get length(): number { return this.states.length }

	constructor(debug_mode?: string) {
		this.debug_mode = debug_mode || null; 
		this.states = [];
	};

	get(index: number): EarleyStateSet {
		if(index < this.states.length) {
			return this.states[index];

		} else {
			while(index >= this.states.length) {
				let set = new EarleyStateSet;
				this.states.push(set);
			}

			return this.states[index];
		}
	};

	public debug(state_index?: number, item_index?: number) {
		for(let i = 0; i < this.length; i++) {
			let state = this.get(i);
			console.log((state_index === i ? '> ' : '') + 'STATE ' + i + ' {');

			for(let j = 0; j < state.items.length; j++) {
				let item = state.items[j];
				let msg = '    ' + (state_index === i && item_index === j ? '> ' : '') + item.debug(this.debug_mode);
				console.log(msg);
			}

			console.log('}');
		}
	};
};

export class EarleyProcessor {
	private parser: EarleyParser;
	private source: string;
	private states: EarleyPushdown;

	constructor(source: string, states: EarleyPushdown) {
		this.source = source;
		this.states = states;
	};

	completed() {
		return this.states.length == (this.source.length + 1) && this.states.get(this.source.length).items.some((i) => i.completed() && i.start === 0);
	};

	tree<T extends INode>(walker: (type: string, tokens: Array<T|string>) => T): T {
		let indexed: EarleyPushdown = new EarleyPushdown('length');
		for(let i = this.states.length - 1; i >= 0; i--) {
			let state = this.states.get(i);

			for(let j = state.items.length - 1; j >= 0; j--) {
				let item = state.items[j];
				if(item.completed()) {
					indexed.get(item.start).push(item);
				}
			}
		}
        indexed.debug();

        let self = this;

        return (function CreateNode(state_index: number, item_index: number, source_index: number): T {
            let state = indexed.get(state_index);

            for(; item_index < state.items.length; item_index++) {
                let item = state.items[item_index];
                console.log('working with ' + state_index + ':' + item_index + ' - ' + item.debug('length'));
                let tokens: Array<T|string> = [];

                if(!item) return null;

                for(let j = 0; j < item.rule.symbols.length; j++) {
                    let symbol = item.rule.symbols[j];
                    let source_offset = source_index + tokens.reduce((val, token) => val + token.length, 0);

                    if(symbol instanceof EarleyTerminal) {
                        console.log('looking for ' + symbol.identify() + ' at source:' + source_offset);
                        let token: string = symbol.match(self.source.substr(source_offset));

                        if(token) {
                            console.log('found token "' + token + '" (' + token.length + ') at ' + source_offset);
                            tokens.push(token);
                            state_index += 1;

                        } else {
                            return null;
                        }

                    // hack to repalce instanceof IProductionReference
                    } else if(isProductionReference(symbol)) {
                        let new_index = (source_offset == item.start ? item_index + 1 : 0);
                        let state = indexed.get(state_index);
                        console.log('looking for ' + symbol.identify() + ' at ' + source_offset + ':' + new_index);
                        let token: T = CreateNode(source_offset, new_index, source_offset);

                        if(token) {
                            tokens.push(token);

                        } else {
                            return null;
                        }
                    }

                }

                console.log('sending back a ' + item.debug('length'));
                return walker(item.rule.production.name, tokens);
            }
        })(0, 0, 0);
	};
};

export class EarleyParser {
	private productions: {[i: string]: EarleyProduction};

	constructor() {
		this.productions = {};
	};

	addRule(name: string, symbols: Array<string|RegExp|IProductionReference>) {
		let prod = this.productions[name];
		if(!prod) {
			prod = new EarleyProduction(name);
			this.productions[name] = prod;
		}

		let imported_symbols: Array<EarleyTerminal|IProductionReference> = [];
		for(let i = 0; i < symbols.length; i++) {
			let symbol = symbols[i];

			if(typeof symbol === 'string') {
				imported_symbols.push(new EarleyTerminal(symbol));

			} else if(symbol instanceof RegExp) {
				imported_symbols.push(new EarleyTerminal(symbol));

            // hack to replace instanceof IProductionReference
			} else if(isProductionReference(symbol)) {
				imported_symbols.push(symbol);
			}
		}
		prod.add(new EarleyRule(imported_symbols));
	};

	public parse(firstProduction: string, source: string) {
		let states: EarleyPushdown = new EarleyPushdown();

		if(firstProduction in this.productions) {
			states.get(0).push(...this.productions[firstProduction].instantiate(0, 0));

		} else {
			throw new Error('could not find production "' + firstProduction + '"');
		}

		let state_index: number = 0;
		while(state_index <= source.length) {
			if(state_index >= states.length) break;
			let state: EarleyStateSet = states.get(state_index);

			let item_index: number = 0;
			while(item_index < state.items.length) {

				let item: EarleyItem = state.items[item_index];
				let next: EarleyTerminal|IProductionReference = item.next();

				// completion
				if(next === null) {
					//console.log('completed rule ' + item.rule.production.name);
					let completion_state: EarleyStateSet = states.get(item.start);
					let addition_state: EarleyStateSet = states.get(state_index);
					for(let i = 0; i < completion_state.items.length; i++) {
						let completion_item: EarleyItem = completion_state.items[i];

						let completion_next: EarleyTerminal|IProductionReference = completion_item.next();
						if(isProductionReference(completion_next) && completion_next.name === item.rule.production.name) {
							//console.log('advanced ' + completion_item.rule.production.name);
							addition_state.push(completion_item.advance(state_index));
						}
					}
					
				// scan
				} else if(next instanceof EarleyTerminal) {
					//console.log('scanning for ' + next.identify());

					let match = next.match(source.substr(state_index));
					if(match) {
						states.get(state_index + 1).push(item.advance(state_index + 1));
					}

				// prediction
				} else if(isProductionReference(next)) {
					//console.log('predicting for ' + next.identify());
					let production = this.productions[next.name];
					if(!production) throw new Error('could not find production "' + next.name + '"');

					// no duplication of productions
					if(!state.items.some((item) => item.rule.production == production && item.start == state_index)) {
						let instances: EarleyItem[] = production.instantiate(state_index, 0);
						//instances.map((i) => console.log('adding to ' + state_index + ': ' + i.debug()));
						state.push(...instances);
					}

				} else {
					throw new Error('invalid symbol found in rule');
				}

				//states.debug(state_index, item_index);
				//console.log('------------------------------');
				item_index++;
			}
			state_index++;
		}

		return new EarleyProcessor(source, states);
	};
};