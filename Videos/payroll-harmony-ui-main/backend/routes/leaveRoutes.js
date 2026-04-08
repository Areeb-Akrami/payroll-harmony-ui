const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leave-controller');

router.get('/', leaveController.getAllLeaves);
router.post('/', leaveController.addLeave);
router.patch('/:id/status', leaveController.updateLeaveStatus);

module.exports = router;