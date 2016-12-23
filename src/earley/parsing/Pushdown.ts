import {Item} from './Item';
import {State} from './interfaces';

export class Pushdown {
	private states: Item[][];
	private debug_mode: string;

	get length(): number { return this.states.length }

	constructor(debug_mode?: string) {
		this.debug_mode = debug_mode || null;
		this.states = [];
	}

	merge(diff: State) {
		this.get(diff.index).push(...diff.items);
	}

	get(index: number) {
		if(index < this.states.length) {
			return this.states[index];

		} else {
			while(index >= this.states.length) {
				const set: Item[] = [];
				this.states.push(set);
			}

			return this.states[index];
		}
	}
};
