const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.send('Anomaly GET endpoint'));
router.put('/:id/status', (req, res) => res.send('Anomaly PUT status endpoint'));

module.exports = router;