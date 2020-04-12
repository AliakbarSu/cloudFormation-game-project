const { Just, Nothing } = require("folktale/maybe")
const { curry } = require('lodash')

const convertSubToUid = curry((validator, sub) => 
    validator(sub) ? Just(sub.substr(0, 12)) : Nothing())

module.exports = {
    convertSubToUid
}