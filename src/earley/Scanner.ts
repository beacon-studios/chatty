import {Reference} from './symbols/Reference';
import {ProductionSet} from './rules';
import {Pushdown} from './parsing';

export class Scanner {

	constructor(
		private _prods: ProductionSet,
	) {}

	public parse(entry: string, source: string) {
		let states: Pushdown = new Pushdown();

		if(this._prods.has(entry)) {
			states.get(0).push(...this._prods.get(entry).instantiate(0, 0));

		} else {
			throw new Error(`could not find production "${entry}"`);
		}

		for(let si = 0; si <= source.length; si++) {
			if(si >= states.length) break;
			const items = states.get(si);
			const state = {
				index: si,
				items,
			}

			for(let ii = 0; ii < items.length; ii++) {
				const item = items[ii];
				const next_symbol = item.next();

				if(next_symbol) {
					states.merge(next_symbol.match(state, item, source));

				} else {
					const complete_state = states.get(item.start);
					for(const complete_item of complete_state) {
						const complete_next = complete_item.next();

						if(complete_next instanceof Reference && complete_next.production === item.production) {
							items.push(complete_item.advance());
						}
					}
				}
			}
		}

		return states;
	}

}
