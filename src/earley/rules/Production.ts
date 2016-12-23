import {Item} from '../parsing';
import {Symbol} from '../interfaces';

export class Production {
  get name() { return this._name }

	constructor(
    private _name: string,
    private _rules: Symbol[][] = [],
  ) {}

	public add(...rules: Symbol[][]) {
    this._rules.push(...rules);
	}

	instantiate(start: number = 0, current: number = 0) {
		let items: Item[] = this._rules.map(rule => new Item(this, rule, {start, current}));
		return items;
	}

};
