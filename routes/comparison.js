const express = require('express')
const router = express.Router()

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('upload-page', {
    title: 'SDG Metadata Comparison Report',
    action: '/compare',
  })
})

module.exports = router
