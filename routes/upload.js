const express = require('express')
const multer = require('multer')
const { WordTemplateInput } = require('sdg-metadata-convert')
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
            input.read(indicator.path)
                .then(metadata => writeMetadata(metadata, indicator.originalname))
                .catch(err => res.status(500).send(err))

            res.send({
                status: true,
                message: 'Indicators were uploaded.',
                data: {},
            })
        }
    }
    catch(err) {
        res.status(500).send(err)
    }
})

function writeMetadata(metadata, filename) {
    //console.log(metadata)
    console.log(filename)
}

module.exports = router
