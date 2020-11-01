const path = require('path')
const express = require('express')
const multer = require('multer')
const { WordTemplateInput, SdmxInput } = require('sdg-metadata-convert')
const router = express.Router()
const helpers = require('../lib/helpers')

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
            const zipTempFile = path.join('user_uploads', indicator.filename + '-comparison.zip')
            const zipDestFile = helpers.convertFilename(indicator.originalname, '-comparison.zip')
            const sourceTempFile = path.join('user_uploads', indicator.filename + '-source-comparison.html')
            const sourceDestFile = helpers.convertFilename(indicator.originalname, '-source-comparison.html')
            const renderedTempFile = path.join('user_uploads', indicator.filename + '-rendered-comparison.pdf')
            const renderedDestFile = helpers.convertFilename(indicator.originalname, '-rendered-comparison.pdf')

            let messages
            input.read(indicator.path)
                .then(metadata => {
                    messages = metadata.getMessages()
                    return createComparisonFiles(metadata, sourceTempFile, renderedTempFile)
                })
                .then(() => helpers.zipOutputFiles(zipTempFile, [
                    {
                        from: sourceTempFile,
                        to: sourceDestFile,
                    },
                    {
                        from: renderedTempFile,
                        to: renderedDestFile,
                    }
                ]))
                .then(() => res.send({
                    status: true,
                    message: 'Comparison successfully generated.',
                    data: {
                        filePath: zipTempFile,
                        downloadName: zipDestFile,
                        warnings: messages,
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

async function createComparisonFiles(newMeta, sourceFile, renderedFile) {
    let oldSource = 'https://unstats.un.org/SDGMetadataAPI/api/Metadata/SDMXReport/'

    const reportingType = newMeta.getDescriptor('REPORTING_TYPE')
    const refArea = newMeta.getDescriptor('REF_AREA')
    // For now we compare only the first series, if there are multiple.
    let series = newMeta.getDescriptor('SERIES')
    if (Array.isArray(series)) {
        series = series[0]
    }

    oldSource += [reportingType, series, refArea].join('.')

    const sdmxInput = new SdmxInput()
    try {
        const diff = await sdmxInput.compareWithOldVersion(oldSource, newMeta)
        await diff.writeSourceHtml(sourceFile, undefined, helpers.getPuppeteerLaunchOptions())
        await diff.writeRenderedPdf(renderedFile, undefined, helpers.getPuppeteerLaunchOptions())
    }
    catch (e) {
        //throw e.message
        console.log('Unable to generate comparison report.')
        console.log(e.message)
    }
}

module.exports = router
