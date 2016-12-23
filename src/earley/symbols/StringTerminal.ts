import {Symbol, State} from '../interfaces';
import {Item} from '../Item';

export class StringTerminal implements Symbol {

	constructor(private _value: string) {
	}

	identify() {
		return '"' + this._value + '"';
	}

	match(state: State, item: Item, input: string) {
			const match = input.startsWith(this._value, state.index);

			if(match) {
				return {
					index: state.index + 1,
					items: [item.advance()],
				}

			} else {
				return null;
			}
	}

};
