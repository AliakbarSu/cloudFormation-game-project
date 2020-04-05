const { 
    createCollection, 
    updateCollection, 
    deleteCollection } = require('../../../../../src/mongoDBAtlas/collection/collection')

var chai = require('chai');
const expect = chai.expect
const sinon = require('sinon')
const MongoClient = require('mongodb')




describe("Collection", function() {
    let mongoClientStub, createCollectionStub,
    dropCollectionStub
    
    let event = {
        PhysicalResourceId: "test_collection",
        database: "test_database",
        collection: "test_collection",
        url: "test_url",
        config: {}
    }
    
    

    const collection = {
        collectionName: "test_collection"
    }

    const mockMongoClient = function() {
        createCollectionStub = sinon.fake.resolves(collection)
        dropCollectionStub = sinon.fake.resolves(collection)

        this.connect = sinon.fake.resolves()
        this.db = () => ({
            createCollection: createCollectionStub, 
            dropCollection: dropCollectionStub
        })
    }
    
    this.beforeAll(() => {
        mongoClientStub = sinon.stub(MongoClient, "MongoClient").returns(new mockMongoClient)
    })

    this.beforeEach(() => {
        mongoClientStub.resetHistory()
        createCollectionStub.resetHistory()
        dropCollectionStub.resetHistory()
    })

    this.afterAll(() => {
        mongoClientStub.restore()
    })

    describe("createCollection", function() {
        it("Should throw error if required arguments are not provided or is invalid", async () => {
            try {
                await createCollection(null)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(createCollectionStub.calledOnce).to.be.false
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }
    
            try {
                await createCollection({...event, url: null})
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(createCollectionStub.calledOnce).to.be.false
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }
    
            try {
                await createCollection({...event, collection: null})
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(createCollectionStub.calledOnce).to.be.false
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }

            try {
                await createCollection({...event, database: null})
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(createCollectionStub.calledOnce).to.be.false
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }
        })
    
        it("Should invoke db.createCollection and pass the database name", async () => {
            await createCollection(event)
            expect(createCollectionStub.calledOnce).to.be.true
            expect(createCollectionStub.getCall(0).args[0]).to.equal(event.collection)
            expect(createCollectionStub.getCall(0).args[1]).to.equal(event.config)
        })
    })

    describe("updateCollection", function() {
        it("Should throw error if required arguments are not provided or is invalid", async () => {
            try {
                await updateCollection(null)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(createCollectionStub.calledOnce).to.be.false
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }
    
            try {
                await updateCollection({...event, url: null})
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(createCollectionStub.calledOnce).to.be.false
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }
    
            try {
                await updateCollection({...event, collection: null})
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(createCollectionStub.calledOnce).to.be.false
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }
        })
    
        it("Should invoke db.createCollection and pass the database name", async () => {
            await updateCollection(event)
            expect(createCollectionStub.calledOnce).to.be.true
            expect(createCollectionStub.getCall(0).args[0]).to.equal(event.collection)
            expect(createCollectionStub.getCall(0).args[1]).to.equal(event.config)
        })
    })

    describe("deleteCollection", function() {
        it("Should throw error if required arguments are not provided or is invalid", async () => {
            try {
                await deleteCollection(null)
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(dropCollectionStub.calledOnce).to.be.false
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }
    
            try {
                await deleteCollection({...event, url: null})
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(dropCollectionStub.calledOnce).to.be.false
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }
    
            try {
                await deleteCollection({...event, collection: null})
                throw new Error("FALSE_PASS")
            }catch(err) {
                expect(dropCollectionStub.calledOnce).to.be.false
                expect(err.message).to.equal("INVALID_ARGUMENTS_PROVIDED")
            }
        })
    
        it("Should invoke db.dropCollection and pass the database name", async () => {
            await deleteCollection(event)
            expect(dropCollectionStub.calledOnce).to.be.true
            expect(dropCollectionStub.getCall(0).args[0]).to.equal(event.collection)
        })
    })
})