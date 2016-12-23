
module.exports = () => {
  this.Given(/^I have a language called "([^"]+)"$/, name => {
    return this.language = this.parser.load(__dirname + '/../fixtures/languages/' + name);
  });
  this.When(/^I parse the string "([^"])"$/, str => {
    return this.parse = this.language.parse(str);
  });
}
