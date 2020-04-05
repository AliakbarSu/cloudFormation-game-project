const CLUSTER = require('./cluster')

exports.checkClusterStatus = async (event, checkInterval, total) => {
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
                if(cluster.stateName.toUpperCase() == "IDLE") {
                    clearInterval(interval)
                    resolve(cluster)
                }
            }catch(err) {
                console.log(err)
            }
        }, checkInterval)
        
    })
}
  