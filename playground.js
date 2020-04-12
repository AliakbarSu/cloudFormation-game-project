const { curry, flow } = require('lodash/fp')
const { Just, Nothing } = require("folktale/maybe")
const jose = require('node-jose');
// const { isValidToken } = require('../validators/index')
const token = "eyJraWQiOiJ3eUdMQjVYcmc3RUJ0UEZQTUlVMDBtelZSU3liZW81U2YyVUZvR1BwNFJvPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI0N2IxNDRiYS1kNzhjLTRjYWMtODc0Zi05Y2YwMzlkMGYzYjkiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYmlydGhkYXRlIjoiMDgtMDgtMTk5OSIsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy1lYXN0LTEuYW1hem9uYXdzLmNvbVwvdXMtZWFzdC0xXzVpOWhMUXlUTiIsImNvZ25pdG86dXNlcm5hbWUiOiJhbGlzdSIsImdpdmVuX25hbWUiOiJhbGkiLCJhdWQiOiJnZHZpZzA3a2ozNGM3bHR0azU3Y2NnZWJjIiwiZXZlbnRfaWQiOiI3YzZjMzNjNS1lOTZmLTQ2NjYtYTAyYi1jNGJlMzUyZDVmNTciLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTU4NDY4MTMyNywiZXhwIjoxNTg0Njg0OTI3LCJpYXQiOjE1ODQ2ODEzMjcsImZhbWlseV9uYW1lIjoic3VsdGFuaSIsImVtYWlsIjoiYWxpYWtiYXIuc3VAZ21haWwuY29tIn0.DM8azUsQQY8_CH7wkuURxvjpmpQM3kneHrBKjGJqmaiE_wMUDrN9TEEhrNMyOAjDR9NLQLPVCzoeEvE_l_0ap4VFUWbw4Jrt4pbtGciFq8XP4kPs_IRMzIH4abQjqo7P1GTj3rOgeaKQIJ9ltUflVg3LeGZcxL8ZM6Jv0bUqqqOvrJOF4QCEeIAdt7juqGsyL59YOAowVkYKV7Gnk86YtVIsK3sdSCFotwG8SolCTUn3Y6U-_S3NpcThFnREoHyMCbvo1eovwquDqmlBTalZMTQcknaeIm0C4C3Nmc13lkdtThwjCd47E9SUBvgnY7DzExydQzVFSv-p1aO4Fwtc6w"

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

const isTokenValid = (token) => token.length > 5


const extractKeySafe = curry((decoder, parser, token) => {
    if(isTokenValid(token)) {
        return decode(decoder, token).then(token => {
            return getKid(parse(parser, token))
        })
    }else {
        return Promise.reject("Invalid token")
    }
})




extractKeySafe(jose.util.base64url.decode, JSON.parse)(token)
