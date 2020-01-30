const express = require('express');

const watsonController = require('../controllers/watson');

const router = express.Router();

router.get('/', watsonController.getIndex);

router.post('/', watsonController.postMessage);

router.get('/api/speech-to-text/token', watsonController.getSttToken);

router.get('/api/text-to-speech/token', watsonController.getTtsToken);

module.exports = router;