import {IProduction, IProductionSet} from '../interfaces';

export class ProductionSet implements IProductionSet {
    private _productions: IProduction[];

    constructor() {
        this._productions = [];
    };

    push(production: IProduction) {
      this._productions.push(production);

        return this;
    };

    first(): IProduction {
      return this._productions.length > 0 ? this._productions[0] : null;
    }

    all(): IProduction[] {
        return this._productions;
    };
};
