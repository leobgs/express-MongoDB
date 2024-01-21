
const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');

// CRUD API endpoints
router.get('/items', itemController.getAllItems);
router.post('/items', itemController.addItem);
router.put('/items/:id', itemController.updateItem);
router.delete('/items/:id', itemController.deleteItem);
router.post('/items/delete', itemController.deleteSelectedItems);

// Search API endpoint
router.get('/items/search', itemController.searchItems);

module.exports = router;
