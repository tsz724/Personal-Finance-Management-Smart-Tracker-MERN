const Income = require('../models/Income');
const IncomeCategory = require('../models/IncomeCategory');
const { isValidObjectId } = require('mongoose');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

exports.listCategories = async (req, res) => {
  const userId = req.user.id;
  try {
    const categories = await IncomeCategory.find({ user: userId }).sort({ name: 1 });
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error listing income categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createCategory = async (req, res) => {
  const userId = req.user.id;
  try {
    const { name, icon } = req.body;
    const trimmed = typeof name === 'string' ? name.trim() : '';
    if (!trimmed) {
      return res.status(400).json({ message: 'Category name is required.' });
    }

    const exists = await IncomeCategory.findOne({
      user: userId,
      name: new RegExp(`^${escapeRegex(trimmed)}$`, 'i'),
    });
    if (exists) {
      return res.status(409).json({ message: 'A category with this name already exists.' });
    }

    const category = new IncomeCategory({ user: userId, name: trimmed, icon });
    await category.save();
    res.status(201).json({ message: 'Category created successfully', category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'A category with this name already exists.' });
    }
    console.error('Error creating income category:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateCategory = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  try {
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid category id.' });
    }

    const category = await IncomeCategory.findOne({ _id: id, user: userId });
    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    const { name, icon } = req.body;
    if (name !== undefined) {
      const trimmed = typeof name === 'string' ? name.trim() : '';
      if (!trimmed) {
        return res.status(400).json({ message: 'Category name cannot be empty.' });
      }
      const dup = await IncomeCategory.findOne({
        user: userId,
        _id: { $ne: id },
        name: new RegExp(`^${escapeRegex(trimmed)}$`, 'i'),
      });
      if (dup) {
        return res.status(409).json({ message: 'A category with this name already exists.' });
      }
      category.name = trimmed;
    }
    if (icon !== undefined) category.icon = icon;

    await category.save();
    res.status(200).json({ message: 'Category updated successfully', category });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'A category with this name already exists.' });
    }
    console.error('Error updating income category:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteCategory = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  try {
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid category id.' });
    }

    const category = await IncomeCategory.findOne({ _id: id, user: userId });
    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    const inUse = await Income.exists({ category: id });
    if (inUse) {
      return res.status(409).json({
        message: 'This category is still used by one or more income entries. Remove or reassign them first.',
      });
    }

    await IncomeCategory.deleteOne({ _id: id, user: userId });
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting income category:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
