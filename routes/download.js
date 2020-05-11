const path = require('path')
const fs = require('fs')
const express = require('express')
const router = express.Router()

router.get('/', function(req, res) {
    if (!fs.existsSync(req.query.filePath)) {
        res.status(500).send('Original file did not exist.')
    }
    else {
        res.download(req.query.filePath)
    }
})

module.exports = router
