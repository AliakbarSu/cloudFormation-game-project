
require.resolve()

exports.logMe = () => {
    const { getValue } = require('./playground3')
    console.log(getValue())
}



