const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.send('Payroll GET endpoint'));
router.post('/run', (req, res) => res.send('Payroll RUN endpoint'));

module.exports = router;