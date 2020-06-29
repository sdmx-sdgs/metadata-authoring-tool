const path = require('path')
const fs = require('fs')
const express = require('express')
const multer = require('multer')
const yazl = require('yazl')
const { WordTemplateInput, SdmxOutput, PdfOutput } = require('sdg-metadata-convert')
const router = express.Router()

const upload = multer({
    dest: 'user_uploads/'
})

router.get('/', function(req, res, next) {
    res.send('respond with a resource')
});

router.post('/', upload.single('file'), async (req, res) => {
    try {
        const indicator = req.file
        if (!indicator) {
            res.status(400).send({
                status: false,
                data: 'No indicators were sent',
            })
        }
        else {
            const input = new WordTemplateInput()
            const sdmxOutput = new SdmxOutput()
            const pdfOutput = new PdfOutput({
                puppeteerLaunchOptions: {
                    // This is necessary on Heroku.
                    // @See https://github.com/jontewks/puppeteer-heroku-buildpack
                    args: ['--no-sandbox']
                }
            })
            const sdmxOutputFile = path.join('user_uploads', indicator.filename + '.xml')
            const pdfOutputFile = path.join('user_uploads', indicator.filename + '.pdf')
            const zipOutputFile = path.join('user_uploads', indicator.filename + '.zip')
            let messages
            input.read(indicator.path)
                .then(metadata => sdmxOutput.write(metadata, sdmxOutputFile))
                .then(metadata => pdfOutput.write(metadata, pdfOutputFile))
                .then(metadata => {
                    messages = metadata.getMessages()
                    return zipOutputFiles(sdmxOutputFile, pdfOutputFile, zipOutputFile, indicator.originalname)
                })
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

function convertFilename(filename, newExtension) {
    const oldExtension = path.extname(filename)
    return path.basename(filename, oldExtension) + newExtension
}

function zipOutputFiles(sdmxFilePath, pdfFilePath, zipFilePath, originalFilename) {
    return new Promise((resolve, reject) => {
        const zipfile = new yazl.ZipFile()
        const writeStream = fs.createWriteStream(zipFilePath)
        zipfile.addFile(sdmxFilePath, convertFilename(originalFilename, '.xml'))
        zipfile.addFile(pdfFilePath, convertFilename(originalFilename, '.pdf'))
        zipfile.outputStream.pipe(writeStream).on('close', () => {
            resolve('Success')
        })
        zipfile.end()
    })
}

module.exports = router
