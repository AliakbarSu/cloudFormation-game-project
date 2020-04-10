const jose = require('node-jose');


exports.extractKid = (token) => {
    if(!token) {
        throw new Error("TOKEN_NOT_PROVIDED")
    }

    const sections = token.split('.');
    let header = jose.util.base64url.decode(sections[0]);
    header = JSON.parse(header);
    return header.kid;
}