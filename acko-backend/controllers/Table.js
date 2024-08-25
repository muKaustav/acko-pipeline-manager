require('dotenv').config()
const { Sequelize } = require('sequelize')
const { getOrSetCache } = require('../utils/redis')
const { SuccessResponse, ErrorResponse } = require('../utils/apiResponse')

const pgInstance = new Sequelize({
    dialect: 'postgres',
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    username: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
})

const mysqlInstance = new Sequelize({
    dialect: 'mysql',
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
})

const getTableNames = async (sequelizeInstance) => {
    try {
        let result = await sequelizeInstance.getQueryInterface().showAllTables()
        return result
    } catch (err) {
        console.error('Error fetching table names:', err)
        throw err
    }
}

const getPgTables = async (req, res) => {
    try {
        let tables = await getOrSetCache('pg_tables', async () => {
            return await getTableNames(pgInstance)
        }, 3600)
        return new SuccessResponse('Fetched PostgreSQL tables successfully', { tables }, 200).send(res)
    } catch (error) {
        console.error('Error fetching PostgreSQL tables:', error)
        return new ErrorResponse('Internal Server Error', error.message, 500).send(res)
    }
}

const getMysqlTables = async (req, res) => {
    try {
        const tables = await getOrSetCache('mysql_tables', async () => {
            return await getTableNames(mysqlInstance)
        }, 3600)
        return new SuccessResponse('Fetched MySQL tables successfully', { tables }, 200).send(res)
    } catch (error) {
        console.error('Error fetching MySQL tables:', error)
        return new ErrorResponse('Internal Server Error', error.message, 500).send(res)
    }
}

module.exports = { getPgTables, getMysqlTables }