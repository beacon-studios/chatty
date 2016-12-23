import {Symbol, State} from '../interfaces';
import {Item} from '../Item';

export class RegexTerminal implements Symbol {

	constructor(private _value: RegExp) {
	}

	identify() {
		return this._value.toString();
	}

	match(state: State, item: Item, input: string) {
		const match = input.match(this._value);

		if(match && match.index === 0) {
			return {
				index: state.index,
				items: [item.advance()],
			};

		} else {
			return null;
		}
	}

};
