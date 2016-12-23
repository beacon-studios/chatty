import {Reference} from './symbols/Reference';
import {Pushdown} from './Pushdown';
import {INode, IDefaultNodeMethod, ITerminalMethod} from '../interfaces';

export class Processor {
	private source: string;
	private states: Pushdown;

	constructor(source: string, states: Pushdown) {
		this.source = source;
		this.states = states;
	}

	completed() {
		return this.solutions().length > 0;
	}

  solutions() {
      return this.states.get(this.source.length).items.filter(i => i.completed() && i.start === 0);
  }

  isAmbiguous() {
      return this.solutions().length > 1;
  }

	tree(walker: IDefaultNodeMethod, terminal: ITerminalMethod): INode {
		let indexed: Pushdown = new Pushdown('length');
		for(let i = this.states.length - 1; i >= 0; i--) {
			let state = this.states.get(i);

			for(let j = state.items.length - 1; j >= 0; j--) {
				let item = state.items[j];
				if(item.completed()) {
					indexed.get(item.start).push(item);
				}
			}
		}

    let self = this;

    let ret = (function CreateNode(state_index: number, item_index: number, depth: number): {token: INode, length: number} {
      let state = indexed.get(state_index);

      for(; item_index < state.items.length; item_index++) {
        let item = state.items[item_index];
        let tokens: Array<INode> = [];

        let p = function(msg, depth) { console.log(Array(depth + 1).join('  ') + '[' + state_index + ':' + item_index + '] ' + msg); };
        p('running ' + item.debug('length'), depth);

        if(!item) return null;

        for(let j = 0; j < item.rule.symbols.length; j++) {
          let symbol = item.rule.symbols[j];
					if(symbol instanceof Reference) {
            let new_index = (state_index == item.start ? item_index + 1 : 0);
            let state = indexed.get(state_index);
            let ret = CreateNode(state_index, new_index, depth + 1);

            if(ret) {
              //p('found ' + symbol.identify() + ' for ' + item.debug('length') + ' at ' + state_index, depth);
              tokens.push(ret.token);
              state_index = ret.length;
              continue;

            } else {
              p('!NO ' + symbol.identify() + ' for ' + item.debug('length') + ' at ' + state_index, depth);
              return null;
            }

          } else {
            let token: string = symbol.match(self.source.substr(state_index));

            if(token) {
              p('found token "' + token + '" for ' + item.debug('length') + ' at ' + state_index, depth + 1);
              state_index += token.length;
              tokens.push(terminal(token, {}));
              continue;

            } else {
              p('!NO token "' + symbol.identify() + '" for ' + item.debug('length') +' at ' + state_index, depth + 1);
              return null;
            }
					}
        }

        return {token: walker(item.rule.production.name, tokens, {}), length: state_index};
      }

      return null;
    })(0, 0, 0);

    if(ret) {
      return ret.token;

    } else {
      return null;
    }
	};
};
