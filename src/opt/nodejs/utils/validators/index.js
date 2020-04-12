
const isValidSub = sub => sub && sub.length >= 12

const isValidToken = token => token !== null && token.length === 0


module.exports = {
    isValidSub,
    isValidToken
}