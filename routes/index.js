const express = require('express')
const router = express.Router()

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('upload-page', {
    title: 'SDG Metadata SDMX Converter',
    action: '/convert',
    introduction: 'Use this tool to convert your metadata into SDMX and PDF files.',
  })
})

module.exports = router
