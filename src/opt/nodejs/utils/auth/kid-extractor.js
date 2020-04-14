const { curry, flow } = require('lodash/fp')
// const { Just, Nothing } = require("folktale/maybe")
const jose = require('node-jose');
const { isValidToken } = require('../validators/index')


const invalidTokenError = () => new Error("INVALID_TOKEN_PROVIDED")
const failedToParseHeaderError = () => new Error("FAILED_TO_PARSE_HEADER")
const failedToDecodeTokenError = () => new Error("FAILED_TO_DECODE_TOKEN")

const split = curry(token => {
    return token.split(".")[0]
})

const decode = curry((decoder, token) => {
    try {
        const result = decoder(split(token))
        return Promise.resolve(result)
    }catch(err) {
        return Promise.reject(failedToDecodeTokenError())
    }
})

const parse = curry((parser, header) => {
    try {
        return Promise.resolve(parser(header))
    }catch(err) {
        return Promise.reject(failedToParseHeaderError())
    }
    
})

const getKid = curry(header => header.kid)


const extractKeySafe = curry((decoder, parser, token) => {
        if(isValidToken(token))
            return decode(decoder, token)
            .then(header => parse(parser, header))
            .then(parsedHeader => getKid(parsedHeader))
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
    extractKeySafe,
    failedToDecodeTokenError,
    failedToParseHeaderError
}