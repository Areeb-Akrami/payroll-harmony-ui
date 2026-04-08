const express = require('express');
const router = express.Router();

router.post('/', (req, res) => res.send('Bonus POST endpoint'));

module.exports = router;