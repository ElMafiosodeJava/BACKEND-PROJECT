const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const { createIncident } = require('../controllers/incidents.controller');

const router = express.Router();

router.post('/', authMiddleware, roleMiddleware('USER'), createIncident);

module.exports = router;