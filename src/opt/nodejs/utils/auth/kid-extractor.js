const { curry, flow } = require('lodash/fp')
// const { Just, Nothing } = require("folktale/maybe")
const jose = require('node-jose');
const { isValidToken } = require('../validators/index')


const invalidTokenError = () => new Error("INVALID_TOKEN_PROVIDED")

const split = curry(token => {
    return token.split(".")[0]
})

const decode = curry((decoder, token) => {
    return new Promise(success => {
        const result = decoder(split(token))
        success(result)
    })
})

const parse = curry((parser, header) => parser(header))

const getKid = curry(header => header.kid)


const extractKeySafe = curry((decoder, parser, token) => {
        if(isValidToken(token))
            return decode(decoder, token).then(header => getKid(parse(parser, header)))
        else 
            return Promise.reject(invalidTokenError())
    }
)



module.exports = {
    extracKid: extractKeySafe(jose.util.base64url.decode, JSON.parse),
    split,
    decode,
    parse,
    getKid,
    invalidTokenError,
    extractKeySafe
}