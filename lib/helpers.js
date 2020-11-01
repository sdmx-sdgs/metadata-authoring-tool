const path = require('path')
const fs = require('fs')
const yazl = require('yazl')

module.exports = {
    convertFilename: function(filename, newExtension) {
        const oldExtension = path.extname(filename)
        return path.basename(filename, oldExtension) + newExtension
    },
    zipOutputFiles: function (zipFilePath, filesToZip) {
        return new Promise((resolve, reject) => {
            const zipfile = new yazl.ZipFile()
            const writeStream = fs.createWriteStream(zipFilePath)
            for (const fileToZip of filesToZip) {
                if (fs.existsSync(fileToZip.from)) {
                    zipfile.addFile(fileToZip.from, fileToZip.to)
                }
            }
            zipfile.outputStream.pipe(writeStream).on('close', () => {
                resolve('Success')
            })
            zipfile.end()
        })
    },
    getPuppeteerLaunchOptions: function() {
        // This is necessary on Heroku.
        // @See https://github.com/jontewks/puppeteer-heroku-buildpack
        return {
            args: ['--no-sandbox'],
        }
    }
}
