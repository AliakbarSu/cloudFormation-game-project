const { curry, flow } = require('lodash')
const { Just, Nothing } = require("folktale/maybe")
const jose = require('node-jose');
// const { isValidToken } = require('../validators/index')


const split = curry(token => token.split(".")[0])

const decode = curry((decoder, hash) => {
    new Promise(success => {
        const result = decoder(hash)
        success(result)
    })
})

const parse = curry((header, parser) => parser(header))

const getKid = curry(header => header.kid)



const extractKid = curry((decoder, parser, isValidToken, token) => 
    isValidToken(token) ? 
        Just(getKid(
                parse(
                    decode(
                        decoder, 
                        split(token)), parser))) : 
        Nothing()
) 


console.log(extractKid(jose.util.base64url.decode, JSON.parse, () => true)("fjksajfasfjf.klsfjsf"))
