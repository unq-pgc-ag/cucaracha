var peg = require("pegjs");

var parser = peg.generate("start = ('a' / 'b')+");

var results = parser.parse("abba"); // returns ["a", "b", "b", "a"]

console.log(results);
