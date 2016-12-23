import {Production} from './Production';

export class ProductionSet {
  private _prods: {[name: string]: Production} = {};

  constructor(private _prod_factory: (name: string) => Production) {}

  has(name: string) {
    return name in this._prods;
  }

  get(name: string) {
    if(name in this._prods) {
      return this._prods[name];

    } else {
      const prod = this._prod_factory(name);
      this._prods[prod.name] = prod;
      return prod;
    }

  }

};
