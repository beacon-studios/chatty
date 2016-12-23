import {Item} from './Item';

export interface State {
  index: number;
  items: Item[];
};

export interface Symbol {
  identify(): string;
  match(state: State, item: Item, input: string): State;
};
