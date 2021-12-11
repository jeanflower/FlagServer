const express = require('express');
const router = express.Router();
const controller = require('../controllers/flagsite.controller');
const uploadController = require("../controllers/upload");

router.post('/upload', uploadController.uploadFile);
router.get('/image', controller.downloadFile);

router.post('/createFlag', controller.flag_create);
router.get('/allFlags', controller.flags_all);
router.delete('/deleteFlag', controller.flag_delete);

module.exports = router;
