const path = require('path')
const express = require('express')
const multer = require('multer')
const { WordTemplateInput, SdmxOutput, PdfOutput, SdmxInput } = require('sdg-metadata-convert')
const router = express.Router()
const helpers = require('../lib/helpers')
const conceptTranslations = require('../lib/conceptTranslations').getConceptTranslations()

const upload = multer({
    dest: 'user_uploads/'
})

router.post('/', upload.single('file'), async (req, res) => {
    res.setTimeout(90000)
    try {
        const indicator = req.file
        if (!indicator) {
            res.status(400).send({
                status: false,
                data: 'No indicators were sent',
            })
        }
        else {
            const isXml = indicator.mimetype === 'text/xml' || indicator.mimetype === 'application/xml'
            const input = isXml ? new SdmxInput() : new WordTemplateInput()
            const sdmxOutput = new SdmxOutput()
            const pdfOutput = new PdfOutput({
                conceptNames: true,
                conceptTranslations: conceptTranslations,
                puppeteerLaunchOptions: helpers.getPuppeteerLaunchOptions(),
                layoutFolder: path.join(__dirname, '..', 'views'),
                layout: 'pdf-output.njk',
            })

            const zipTempFile = path.join('user_uploads', indicator.filename + '.zip')
            const zipDestFile = helpers.convertFilename(indicator.originalname, '.zip')
            const sdmxTempFile = path.join('user_uploads', indicator.filename + '.xml')
            const sdmxDestFile = helpers.convertFilename(indicator.originalname, '.xml')
            const pdfTempFile = path.join('user_uploads', indicator.filename + '.pdf')
            const pdfDestFile = helpers.convertFilename(indicator.originalname, '.pdf')

            let messages
            let errors = []
            input.read(indicator.path)
                .then(metadata => {
                    metadata.fixMetaLastUpdate()
                    return sdmxOutput.write(metadata, sdmxTempFile)
                })
                .then(metadata => pdfOutput.write(metadata, pdfTempFile))
                .then(metadata => {
                    messages = metadata.getMessages()
                    if (!metadata.validateMetaLastUpdate()) {
                        errors.push('Please provide the date of last update in the format YYYY-MM-DD')
                    }
                    return helpers.zipOutputFiles(zipTempFile, [
                        {
                            from: sdmxTempFile,
                            to: sdmxDestFile,
                        },
                        {
                            from: pdfTempFile,
                            to: pdfDestFile,
                        }
                    ])
                })
                .then(() => {
                    if (errors.length > 0) {
                        throw errors;
                    }
                    res.send({
                        status: true,
                        message: 'Indicator successfully converted.',
                        data: {
                            filePath: zipTempFile,
                            downloadName: zipDestFile,
                            warnings: messages,
                        }
                    })
                })
                .catch(err => {
                    console.log(err)
                    res.status(500).send({
                        warnings: messages,
                        errors: err,
                    })
                })
        }
    }
    catch(err) {
        res.status(500).send(err)
    }
})

module.exports = router
