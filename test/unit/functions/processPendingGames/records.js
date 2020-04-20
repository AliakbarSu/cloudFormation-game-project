module.exports = [
    {
        eventID: '1ef1c0d5bf54e02ab9b8cf1469013a5c',
        eventName: 'INSERT',
        dynamodb: {
            ApproximateCreationDateTime: 1584886254,
            Keys: { _id: { S: 'fsfasf' } },
            NewImage: { 
                players: {
                    M: {
                        playerOne: {M: {}},
                        playerTwo: {M: {}}
                    }
                },
                questions: {
                    L: [
                        {
                            M: {
                                qid: { S: "Q_ONE"},
                                text: { S: "first test question"},
                                answers: {
                                    L: [
                                        {
                                            M: {
                                                aid: { S: "A_ONE"},
                                                text: { S: "first test answer"}
                                            }
                                        }
                                    ]
                                }
                            }
                            
                        },
                        {
                            M: {
                                qid: { S: "Q_ONE"},
                                text: { S: "first test question"},
                                answers: {
                                    L: [
                                        {
                                            M: {
                                                aid: { S: "A_ONE"},
                                                text: { S: "first test answer"}
                                            }
                                        }
                                    ]
                                }
                            }
                            
                        }
                    ]
                }
            },
            SequenceNumber: '38116500000000001441142066'
        },
        eventSourceARN: 'arn:aws:dynamodb:us-east-2:178001805015:table/games/stream/2020-03-17T06:21:52.599'
    }
]