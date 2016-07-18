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
	public symbols: Array<EarleyTerminal|EarleyProductionLookup>;

	constructor(symbols: Array<EarleyTerminal|EarleyProductionLookup>) {
		this.symbols = symbols;
	};
};

class EarleyProductionLookup {
	public name: string;

	constructor(name: string) {
		this.name = name;
	};

	public identify(): string {
		return '<' + this.name + '>';
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

	public next(): EarleyTerminal|EarleyProductionLookup {
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

export class SyntaxNode {
	private _type: string;
	private _tokens: string[];

	constructor(type: string, tokens: string[]) {
		this._type = type;
		this._tokens = tokens;
	};

	type(): string {
		return this._type;
	}

	tokens(): string[] {
		return this._tokens;
	};
}

export class EarleyProcessor {
	private parser: EarleyParser;
	private source: string;
	private states: EarleyPushdown;

	constructor(parser: EarleyParser, source: string, states: EarleyPushdown) {
		this.parser = parser;
		this.source = source;
		this.states = states;
	};

	completed() {
		return this.states.length == (this.source.length + 1) && this.states.get(this.source.length).items.some((i) => i.completed() && i.start === 0);
	};

	tree(): SyntaxNode {
		let indexed: EarleyPushdown = new EarleyPushdown('length');
		for(let i = 0; i < this.states.length; i++) {
			let state = this.states.get(i);

			for(let j = 0; j < state.items.length; j++) {
				let item = state.items[j];
				if(item.completed()) {
					indexed.get(item.start).unshift(item);
				}
			}
		}

		indexed.debug();

		return null;
	};
};

export class EarleyParser {
	private productions: {[i: string]: EarleyProduction};
	private nodes: {[i: string]: { new(type: string, tokens: string[], children: SyntaxNode[]) }};

	constructor() {
		this.productions = {};
		this.nodes = {};
	};

	production(name: string): EarleyProductionLookup {
		return new EarleyProductionLookup(name);
	};

	addRule(name: string, symbols: Array<string|RegExp|EarleyProductionLookup>) {
		let prod = this.productions[name];
		if(!prod) {
			prod = new EarleyProduction(name);
			this.productions[name] = prod;
		}

		let imported_symbols: Array<EarleyTerminal|EarleyProductionLookup> = [];
		for(let i = 0; i < symbols.length; i++) {
			let symbol = symbols[i];

			if(typeof symbol === 'string') {
				imported_symbols.push(new EarleyTerminal(symbol));

			} else if(symbol instanceof RegExp) {
				imported_symbols.push(new EarleyTerminal(symbol));

			} else if(symbol instanceof EarleyProductionLookup) {
				imported_symbols.push(symbol);
			}
		}
		prod.add(new EarleyRule(imported_symbols));
	};

	public node(name: string): { new(type: string, tokens: string[], children: SyntaxNode[]) } {
		if(name in this.nodes) {
			return this.nodes[name];

		} else {
			return SyntaxNode;
		}
	};

	public addNode(name: string, nodeClass: { new(type: string, tokens: string[], children: SyntaxNode[]) }) {
		this.nodes[name] = nodeClass;
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
				let next: EarleyTerminal|EarleyProductionLookup = item.next();

				// completion
				if(next === null) {
					console.log('completed rule ' + item.rule.production.name);

					do {
						let completion_state: EarleyStateSet = states.get(item.start);
						let addition_state: EarleyStateSet = states.get(state_index);
						for(let i = 0; i < completion_state.items.length; i++) {
							let completion_item: EarleyItem = completion_state.items[i];

							let completion_next: EarleyTerminal|EarleyProductionLookup = completion_item.next();
							if(completion_next instanceof EarleyProductionLookup && completion_next.name === item.rule.production.name) {
								console.log('advanced ' + completion_item.rule.production.name);
								addition_state.push(completion_item.advance(state_index));
							}
						}

						break;
					} while(1);
					
				// scan
				} else if(next instanceof EarleyTerminal) {
					console.log('scanning for ' + next.identify());

					let match = next.match(source.substr(state_index));
					if(match) {
						states.get(state_index + 1).push(item.advance(state_index + 1));
					}

				// prediction
				} else if(next instanceof EarleyProductionLookup) {
					console.log('predicting for ' + next.identify());
					let production = this.productions[next.name];
					if(!production) throw new Error('could not find production "' + next.name + '"');

					// no duplication of productions
					if(!state.items.some((item) => item.rule.production == production && item.start == state_index)) {
						let instances: EarleyItem[] = production.instantiate(state_index, 0);
						instances.map((i) => console.log('adding to ' + state_index + ': ' + i.debug()));
						state.push(...instances);
					}

				} else {
					throw new Error('invalid symbol found in rule');
				}

				states.debug(state_index, item_index);
				console.log('------------------------------');
				item_index++;
			}
			state_index++;
		}

		return new EarleyProcessor(this, source, states);
	};
};