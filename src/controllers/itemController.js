
const Item = require('../models/itemModel'); // Update with your actual model

const itemController = {
    getAllItems: async (req, res) => {
        try {
            const items = await Item.find();
            res.json(items);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    addItem: async (req, res) => {
        const { name, description, stock } = req.body;

        try {
            const newItem = new Item({
                name,
                description,
                stock,
            });

            const savedItem = await newItem.save();

            res.json(savedItem);
        } catch (error) {
            console.error('Error:', error);
            res.status(400).json({ error: 'Bad Request' });
        }
    },

    updateItem: async (req, res) => {
        const { name, description, stock } = req.body;
        const itemId = req.params.id;

        try {
            const item = await Item.findById(itemId);

            if (!item) {
                return res.status(404).json({ error: 'Item not found' });
            }

            item.name = name;
            item.description = description;
            item.stock = stock;

            // Save the updated item
            const updatedItem = await item.save();

            res.json(updatedItem);
        } catch (error) {
            console.error('Error:', error);
            res.status(400).json({ error: 'Bad Request' });
        }
    },

    deleteItem: async (req, res) => {
        const itemId = req.params.id;

        try {
            const deletedItem = await Item.findByIdAndDelete(itemId);

            if (!deletedItem) {
                return res.status(404).json({ error: 'Item not found' });
            }

            res.json({ message: 'Item deleted successfully' });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    deleteSelectedItems: async (req, res) => {
        const { ids } = req.body;

        try {
            const deletedItems = await Item.deleteMany({ _id: { $in: ids } });

            if (!deletedItems) {
                return res.status(404).json({ error: 'Items not found' });
            }

            res.json({ message: 'Selected items deleted successfully' });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    searchItems: async (req, res) => {
        try {
            const { name } = req.query;

            if (!name) {
                return res.status(400).json({ error: 'Name parameter is required for search' });
            }

            const regex = new RegExp(name, 'i');

            const items = await Item.find({ name: regex });

            if (items.length === 0) {
                return res.status(404).json({ message: 'No items found with the given name' });
            }

            res.json(items);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
};

module.exports = itemController;
