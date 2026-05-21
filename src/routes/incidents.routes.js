const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const {
  createIncident,
  listMyIncidents
} = require('../controllers/incidents.controller');

const router = express.Router();

router.get('/my', authMiddleware, roleMiddleware('USER'), listMyIncidents);
router.post('/', authMiddleware, roleMiddleware('USER'), createIncident);
router.get('/assigned', authMiddleware, roleMiddleware('TECHNICIAN'), listAssignedIncidents);
module.exports = router;