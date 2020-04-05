const processPendingGames = require("../processPendingGames")
const processPendingRequests = require("../processPendingRequests")
const matchPlayers = require("../matchPlayers");
const acceptRequest = require("../acceptRequest");
const cognitoInitializePlayer = require("../cognito-initialize-player");
const connect = require("../connect");
const disconnect = require("../disconnect");
const fs = require("fs")
const path = require("path")



const readData = (pathFile) => {
    return new Promise((resolve, reject) => {
        fs.readFile(path.resolve(path.join(__dirname, pathFile)), "utf-8", (err, data) => {
            if(err) {
                console.log(err)
                reject(err)
            }
            resolve(data)
        })
    })
}


const FunctionName = process.env["TEST_FUNCTION_NAME"];

(async () => {
    try {
        let dataJSON, data, event;
        switch(FunctionName) {
            case "acceptRequest":
                event = {
                    requestId: "021888d9-f260-41fa-ab99-0b352654fdb8",
                    token: "eyJraWQiOiJ3eUdMQjVYcmc3RUJ0UEZQTUlVMDBtelZSU3liZW81U2YyVUZvR1BwNFJvPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI0N2IxNDRiYS1kNzhjLTRjYWMtODc0Zi05Y2YwMzlkMGYzYjkiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYmlydGhkYXRlIjoiMDgtMDgtMTk5OSIsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy1lYXN0LTEuYW1hem9uYXdzLmNvbVwvdXMtZWFzdC0xXzVpOWhMUXlUTiIsImNvZ25pdG86dXNlcm5hbWUiOiJhbGlzdSIsImdpdmVuX25hbWUiOiJhbGkiLCJhdWQiOiJnZHZpZzA3a2ozNGM3bHR0azU3Y2NnZWJjIiwiZXZlbnRfaWQiOiI3YzZjMzNjNS1lOTZmLTQ2NjYtYTAyYi1jNGJlMzUyZDVmNTciLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTU4NDY4MTMyNywiZXhwIjoxNTg0Njg0OTI3LCJpYXQiOjE1ODQ2ODEzMjcsImZhbWlseV9uYW1lIjoic3VsdGFuaSIsImVtYWlsIjoiYWxpYWtiYXIuc3VAZ21haWwuY29tIn0.DM8azUsQQY8_CH7wkuURxvjpmpQM3kneHrBKjGJqmaiE_wMUDrN9TEEhrNMyOAjDR9NLQLPVCzoeEvE_l_0ap4VFUWbw4Jrt4pbtGciFq8XP4kPs_IRMzIH4abQjqo7P1GTj3rOgeaKQIJ9ltUflVg3LeGZcxL8ZM6Jv0bUqqqOvrJOF4QCEeIAdt7juqGsyL59YOAowVkYKV7Gnk86YtVIsK3sdSCFotwG8SolCTUn3Y6U-_S3NpcThFnREoHyMCbvo1eovwquDqmlBTalZMTQcknaeIm0C4C3Nmc13lkdtThwjCd47E9SUBvgnY7DzExydQzVFSv-p1aO4Fwtc6w"
                }
                await acceptRequest.handler(event, {})
            break;
            case "processPendingGames":
                dataJSON = await readData("./data/gameRequest.json")
                data = JSON.parse(dataJSON)
                await processPendingGames.handler({...data}, {})
            case "matchPlayers":
                dataJSON = await readData("./data/playerDocument.json")
                data = JSON.parse(dataJSON)
                event = {
                    ...data
                }
                await matchPlayers.handler(event, {})
            break;
            case "processPendingRequests":
                dataJSON = await readData("./data/sqsRequestRecords.json")
                data = JSON.parse(dataJSON)
                event = {
                    Records: data
                }
                console.log(event)
                await processPendingRequests.handler(event, {}).then(res => {
                    console.log(res)
                })
            break;
            default:
                console.log("Firing default")
        }   
    }catch(err) {
        console.log(err)
    }
})()



