import {Production} from './Production';
import {Symbol} from './interfaces';

interface ItemOptions {
	start?: number;
	current?: number;
};

export class Item {
	get production() { return this._prod }
	get rule() { return this._rule }
	get start() { return this._start }
	get current() { return this._current }
	
	private _start: number = 0;
	private _current: number = 0;

	constructor(
		private _prod: Production,
		private _rule: Symbol[],
		opts: ItemOptions = {},
	) {
		if('start' in opts) this._start = opts.start;
		if('current' in opts) this._current = opts.current;
	}

	public next(): Symbol {
		if(this._current >= this._rule.length) {
			return null;
		}

		return this._rule[this._current];
	}

	public advance(): Item {
		if(this.completed()) throw new Error('cannot advance an item at the end of its rule');
		return new Item(this._prod, this._rule, {
			start: this._start,
			current: this._current + 1,
		});
	}

	public completed(): Boolean {
		return this._current >= this._rule.length;
	}

};
