

exports.validate = (token_expiration, token_aud) => {
    if(!token_expiration || !token_aud) {
        throw new Error("INVALID_TOKEN_EXP_OR_AUD")
    }

    const currentTime = Math.floor(new Date() / 1000);
    if (currentTime > token_expiration) {
        return new Error("TOKEN_EXPIRED")
    } else if (token_aud !== process.env.COGNITO_USER_POOL_CLIENT) {
        return new Error("NOT_ISSUED_FOR_TARGET_AUDIENCE")
    } else {
        return true
    }
} 