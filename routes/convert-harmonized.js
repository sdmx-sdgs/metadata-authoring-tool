const path = require('path')
const express = require('express')
const multer = require('multer')
const { HarmonizedWordTemplateInput, SdmxOutput } = require('sdg-metadata-convert')
const router = express.Router()
const helpers = require('../lib/helpers')

const upload = multer({
    dest: 'user_uploads/'
})

router.post('/', upload.single('file'), async (req, res) => {
    res.setTimeout(90000)
    try {
        const indicator = req.file
        const descriptors = req.body

        if (!indicator) {
            res.status(400).send({
                status: false,
                data: 'No indicators were sent',
            })
        }
        else {
            const input = new HarmonizedWordTemplateInput()
            const sdmxOutput = new SdmxOutput()

            const sdmxTempFile = path.join('user_uploads', indicator.filename + '.xml')
            const sdmxDestFile = helpers.convertFilename(indicator.originalname, '.xml')

            input.read(indicator.path, descriptors)
                .then(metadata => sdmxOutput.write(metadata, sdmxTempFile))
                .then(metadata => res.send({
                    status: true,
                    message: 'Indicator successfully converted.',
                    data: {
                        filePath: sdmxTempFile,
                        downloadName: sdmxDestFile,
                        warnings: metadata.getMessages(),
                    }
                }))
                .catch(err => {
                    console.log(err)
                    res.status(500).send(err)
                })
        }
    }
    catch(err) {
        res.status(500).send(err)
    }
})

module.exports = router
