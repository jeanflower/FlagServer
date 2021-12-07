const express = require('express');
const router = express.Router();
const controller = require('../controllers/flagsite.controller');
const uploadController = require("../controllers/upload");

router.post('/create', controller.dealership_create);
router.get('/allDealers', controller.dealerships_all);
router.get('/dealers', controller.dealership_names);
router.get('/find', controller.dealership_details);
router.put('/update', controller.dealership_update);
router.delete('/delete', controller.dealership_delete);

router.post('/upload', uploadController.uploadFile);
router.get('/image', controller.downloadFile);

router.post('/createAd', controller.ad_create);
router.get('/allAds', controller.ads_all);
router.delete('/deleteAd', controller.ad_delete);

module.exports = router;
