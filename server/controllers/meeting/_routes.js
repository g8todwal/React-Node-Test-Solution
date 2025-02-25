const express = require('express');
const auth = require('../../middelwares/auth');

const router = express.Router();
const { add, index, view, deleteData, deleteMany } = require('./meeting');

router.post('/',auth, add);
router.get('/', auth, index);
router.get('/view/:id',auth, view);
router.delete('/:id', auth, deleteData);
router.post('/deleteMany', auth, deleteMany);

module.exports = router;