const express = require('express')
const router = express.Router()

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('homepage', {
    title: 'SDG Metadata SDMX Converter'
  })
})

module.exports = router
