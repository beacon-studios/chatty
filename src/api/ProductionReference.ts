import {IProductionReference} from '../interfaces';

export class ProductionReference implements IProductionReference {
    private _name: string;

    get name() { return this._name; };

    constructor(name: string) {
        this._name = name;
    };

    identify(): string {
        return '<' + this.name + '>';
    };
};
