const express = require('express')
const router = express.Router()
const { descriptorStore } = require('sdg-metadata-convert')

/* GET home page. */
router.get('/', (req, res, next) => {
  res.render('upload-page', {
    title: 'SDG Metadata SDMX Converter - Harmonized template',
    action: '/convert-harmonized',
    introduction: 'Use this tool to convert your harmonized metadata into SDMX.',
    descriptors: descriptorStore.getDescriptors(),
  })
})

module.exports = router
