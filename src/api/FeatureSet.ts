import {INode, IFeature, IFeatureSet} from '../interfaces';

export class FeatureSet implements IFeatureSet {
    private _features: {[name: string]: IFeature};

    constructor() {
        this._features = {};
    };
    push(feature: IFeature) {
        this._features[feature.name] = feature;
    };

    all(): IFeature[] {
        return Object.keys(this._features).map((k) => this._features[k]);
    };
};
