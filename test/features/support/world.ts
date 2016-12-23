import {Parser} from '../../../src/api';

module.exports = function() {
  this.World = () => {
    this.parser = new Parser();
  };
};
