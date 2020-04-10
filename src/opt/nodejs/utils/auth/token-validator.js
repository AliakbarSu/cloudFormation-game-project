

exports.validate = async (token_expiration, token_aud) => {
    const currentTime = Math.floor(new Date() / 1000);
    if (currentTime > token_expiration) {
        return Promise.reject(new Error("TOKEN_EXPIRED"))
    } else if (token_aud !== process.env.COGNITO_USER_POOL_CLIENT) {
        return Promise.reject(new Error("NOT_ISSUED_FOR_TARGET_AUDIENCE"))
    } else {
        return true
    }
} 