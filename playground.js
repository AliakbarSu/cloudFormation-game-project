

const testFunc = async () => {
    try {
        return Promise.reject("from try block")
    }catch(err) {
        return Promise.reject("from catch block")
    }
}


testFunc().catch(err => {
    console.log(err)
})
