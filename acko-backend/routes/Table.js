const express = require('express')
const TableController = require('../controllers/Table')

const router = express.Router()

router.get('/pg', TableController.getPgTables)
router.get('/mysql', TableController.getMysqlTables)

module.exports = router