const CLUSTER = require('./cluster')

exports.checkClusterStatus = async (event, checkInterval, total, state) => {
    let count = 0
    return new Promise((resolve) => {
        const interval = setInterval(async () => {
            count++
            if(count == total) {
                clearInterval(interval)
                resolve()
            }
            try {
                console.log(`Fetching cluster state for ${count} time(s).`)
                const cluster = await CLUSTER.fetchCluster(event)
                console.log(`Cluster is at ${cluster.stateName} state.`)
                if(cluster.stateName.toUpperCase() == state.toUpperCase()) {
                    clearInterval(interval)
                    resolve(cluster)
                }
            }catch(err) {
                console.log(err)
            }
        }, checkInterval)
        
    })
}

exports.checkClusterDeleteStatus = async (event, checkInterval, total, state) => {
    let count = 0
    return new Promise((resolve) => {
        const interval = setInterval(async () => {
            count++
            if(count == total) {
                clearInterval(interval)
                resolve()
            }
            try {
                console.log(`Fetching cluster state for ${count} time(s).`)
                await CLUSTER.fetchCluster(event)
            }catch(err) {
                console.log(`Cluster is at DELETING state.`)
                if(err.response.data.errorCode.toUpperCase() == state.toUpperCase()) {
                    clearInterval(interval)
                    resolve()
                }
                console.log(err)
            }
        }, checkInterval)
        
    })
}
  