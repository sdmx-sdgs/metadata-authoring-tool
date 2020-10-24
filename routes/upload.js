const path = require('path')
const fs = require('fs')
const express = require('express')
const multer = require('multer')
const yazl = require('yazl')
const { WordTemplateInput, SdmxOutput, PdfOutput, SdmxInput } = require('sdg-metadata-convert')
const router = express.Router()

const upload = multer({
    dest: 'user_uploads/'
})

const puppeteerLaunchOptions = {
    timeout: 90000,
    headless: true,
    // This is necessary on Heroku.
    // @See https://github.com/jontewks/puppeteer-heroku-buildpack
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
    ],
}

router.get('/', function(req, res, next) {
    res.send('respond with a resource')
});

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
                puppeteerLaunchOptions: puppeteerLaunchOptions,
                layoutFolder: path.join(__dirname, '..', 'views'),
                layout: 'pdf-output.njk',
            })
            const sdmxOutputFile = path.join('user_uploads', indicator.filename + '.xml')
            const pdfOutputFile = path.join('user_uploads', indicator.filename + '.pdf')
            const zipOutputFile = path.join('user_uploads', indicator.filename + '.zip')
            const sourceComparisonFile = path.join('user_uploads', indicator.filename + '-source-comparison.pdf')
            const renderedComparisonFile = path.join('user_uploads', indicator.filename + '-rendered-comparison.pdf')

            let messages
            input.read(indicator.path)
                .then(metadata => sdmxOutput.write(metadata, sdmxOutputFile))
                .then(metadata => pdfOutput.write(metadata, pdfOutputFile))
                .then(metadata => {
                    messages = metadata.getMessages()
                    return createComparisonFiles(metadata, sourceComparisonFile, renderedComparisonFile)
                })
                .then(() => zipOutputFiles(sdmxOutputFile, pdfOutputFile, sourceComparisonFile, renderedComparisonFile, zipOutputFile, indicator.originalname))
                .then(() => res.send({
                    status: true,
                    message: 'Indicator successfully converted.',
                    data: {
                        filePath: zipOutputFile,
                        downloadName: convertFilename(indicator.originalname, '.zip'),
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
        await diff.writeSourceHtml(sourceFile, undefined, puppeteerLaunchOptions)
        await diff.writeRenderedPdf(renderedFile, undefined, puppeteerLaunchOptions)
    }
    catch (e) {
        //throw e.message
        console.log('Unable to generate comparison report.')
        console.log(e.message)
    }
}

function convertFilename(filename, newExtension) {
    const oldExtension = path.extname(filename)
    return path.basename(filename, oldExtension) + newExtension
}

function zipOutputFiles(sdmxFilePath, pdfFilePath, sourceComparisonFile, renderedComparisonFile, zipFilePath, originalFilename) {
    return new Promise((resolve, reject) => {
        const zipfile = new yazl.ZipFile()
        const writeStream = fs.createWriteStream(zipFilePath)
        if (fs.existsSync(sdmxFilePath)) {
            zipfile.addFile(sdmxFilePath, convertFilename(originalFilename, '.xml'))
        }
        if (fs.existsSync(pdfFilePath)) {
            zipfile.addFile(pdfFilePath, convertFilename(originalFilename, '.pdf'))
        }
        if (fs.existsSync(sourceComparisonFile)) {
            zipfile.addFile(sourceComparisonFile, convertFilename(originalFilename, '-source-comparison.pdf'))
        }
        if (fs.existsSync(renderedComparisonFile)) {
            zipfile.addFile(renderedComparisonFile, convertFilename(originalFilename, '-rendered-comparison.pdf'))
        }
        zipfile.outputStream.pipe(writeStream).on('close', () => {
            resolve('Success')
        })
        zipfile.end()
    })
}

module.exports = router
