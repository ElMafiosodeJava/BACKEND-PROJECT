const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const {
  createTechnician,
  listTechnicians,
  deleteTechnician
} = require('../controllers/users.controller');

const router = express.Router();

router.post('/technicians', authMiddleware, roleMiddleware('ADMIN'), createTechnician);
router.get('/technicians', authMiddleware, roleMiddleware('ADMIN'), listTechnicians);
router.delete('/technicians/:id', authMiddleware, roleMiddleware('ADMIN'), deleteTechnician);

module.exports = router;
