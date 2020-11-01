const express = require('express')
const router = express.Router()

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('upload-page', {
    title: 'SDG Metadata Comparison Report',
    action: '/compare',
    introduction: 'Use this tool to compare your metadata with the <a href="https://unstats.un.org/SDGMetadataAPI/swagger/index.html">SDG Metadata API</a>.',
  })
})

module.exports = router
