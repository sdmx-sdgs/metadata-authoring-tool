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

router.post('/', upload.array('file', 10), async (req, res) => {
    try {
        const indicators = req.files
        if (!indicators) {
            res.status(400).send({
                status: false,
                data: 'No indicators were sent',
            })
        }
        else {
            const data = indicators.map(indicator => {
                console.log(indicator)
                return {
                    name: indicator.originalname,
                    mimetype: indicator.mimetype,
                    size: indicator.size,
                }
            })

            res.send({
                status: true,
                message: 'Indicators were uploaded.',
                data: data,
            })
        }
    }
    catch(err) {
        res.status(500).send(err)
    }
})

module.exports = router
