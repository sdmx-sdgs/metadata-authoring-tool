const express = require('express')
const router = express.Router()
const { descriptorStoreLive } = require('sdg-metadata-convert')

/* GET home page. */
router.get('/', async function(req, res, next) {
  res.render('upload-page', {
    title: 'SDG Metadata SDMX Converter - Harmonized template',
    action: '/convert-harmonized',
    introduction: 'Use this tool to convert your harmonized metadata into SDMX.',
    descriptors: await descriptorStoreLive.getDescriptors(),
    timestamp: new Date(await descriptorStoreLive.getCacheTimestamp()).toLocaleString(),
    dsdVersion: await descriptorStoreLive.getDsdVersion(),
  })
})

module.exports = router
