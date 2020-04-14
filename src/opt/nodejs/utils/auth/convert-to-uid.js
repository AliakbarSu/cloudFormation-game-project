const { isValidSub } = require('../validators/index')
const { invalidSubError } = require('../errors/general')

const convertSubToUid = sub => 
    isValidSub(sub) ? Promise.resolve(sub.substr(0, 12)) : Promise.reject(invalidSubError())

module.exports = {
    convertSubToUid
}