import {Symbol, State} from '../interfaces';
import {Item} from '../Item';
import {Production} from '../Production';

export class Reference implements Symbol {
	get production() { return this._prod }

	constructor(private _prod: Production) {
	}

	identify() {
		return `<${this._prod.name}>`;
	}

	match(state: State, item: Item, input: string) {
		if(state.items.some(item => item.production === this._prod && item.start === state.index)) {
			return null;

		} else {
			const items = this._prod.instantiate(state.index, 0);
			return {
				index: state.index,
				items
			};
		}
	}

};
