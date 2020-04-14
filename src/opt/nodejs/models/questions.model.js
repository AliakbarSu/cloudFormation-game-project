const { curry, get, slice } = require('lodash/fp')

const { 
    isValidCategory,
    isValidLanguage,
    isValidLevel,
    isValidLimit,
    isValidTableName
} = require('../utils/validators/index')

const uuid = require('uuid')
const { getConnector } = require('../dynamodb.connector')
const { invalidTableNameError } = require('../utils/errors/general')

const invalidFiltersDataError = () => new Error("INVALID_FILTERS_PROVIDED")
const failedToGenerateQuizeError = () => new Error("FAILED_TO_GENERATE_QUIZE")


const validateFilters = filters => {
    return  isValidCategory(get("subject", filters)) == true &&
            isValidLanguage(get("language", filters)) == true &&
            isValidLevel(get("level", filters)) == true &&
            isValidLimit(get("limit", filters)) == true
}


const applyFiltersLimit = curry((items, limit) => {
    return slice(0, limit, items)
})

const generateQuizeSafe = curry((connector, IdGenerator, tableName, filters) => {
    if(!validateFilters(filters)) {
        return Promise.reject(invalidFiltersDataError())
    }

    if(!isValidTableName(tableName)) {
        return Promise.reject(invalidTableNameError())
    }

    const queryParams = {
        TableName: tableName,
        FilterExpression: 'category = :category AND contains(levels, :level) AND #lang = :language',
        ExpressionAttributeNames: {
            // '#requestId': '_id',
            '#lang': 'language'
        },
        ExpressionAttributeValues: {
            ":category": filters.subject,
            ":level": "Grade " + filters.level,
            ":language": filters.language
        }
    }

    return connector.scan(queryParams).promise().then(result => {
        if(result.Count >= filters.limit)
            return applyFiltersLimit(result.Items, filters.limit)
        else
            return result.Items
    }).catch(() => Promise.reject(failedToGenerateQuizeError()))
})


module.exports = {
    invalidFiltersDataError,
    failedToGenerateQuizeError,
    validateFilters,
    applyFiltersLimit,
    generateQuizeSafe,
    generateQuize: generateQuizeSafe(getConnector, uuid.v4, process.env.DYNAMODB_QUESTIONS_TABLE)
} 