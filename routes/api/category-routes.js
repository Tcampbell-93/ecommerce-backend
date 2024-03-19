const router = require('express').Router();
const { Category, Product, ProductTag } = require('../../models');

// The `/api/categories` endpoint

router.get('/', async (req, res) => {
  // find all categories
  // be sure to include its associated Products
  try {
    const allCategories = await Category.findAll( {
      include: [{ model: Product }]
    });
    
    res.status(200).json(allCategories);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  try {
    // Find one category by its `id` value and include its associated Products
    const categoryData = await Category.findByPk(req.params.id, {
      include: [{ model: Product }]
    });
    
    res.json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {
  // create a new category
  try {
    const newCategory = await Category.create(req.body);
    res.status(200).json(newCategory);
  } catch (err) {
    res.status(400).json(err);
  }
});

router.put('/:id', async (req, res) => {
  try {
    // Update a category by its `id` value
    const updatedCategory = await Category.update(req.body, {
      where: { id: req.params.id }
    });

    if (req.body.categoryIds && req.body.categoryIds.length) {
      const existingCategory = await Category.findByPk(req.params.id, {
        include: [{ model: Category, as: 'associated_categories' }]
      });

      // Extract existing category IDs
      const existingCategoryIds = existingCategory.associated_categories.map(category => category.id);

      // Identify new category IDs
      const newCategoryIds = req.body.categoryIds.filter(categoryId => !existingCategoryIds.includes(categoryId));

      // Create new category associations
      await Promise.all(newCategoryIds.map(async (categoryId) => {
        await CategoryAssociation.create({ category_id: req.params.id, associated_category_id: categoryId });
      }));
    }

    res.json(updatedCategory);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete('/:id', async (req, res) => {
  // delete a category by its `id` value
  try {
    const categoryData = await Category.destroy({
      where: {
        id: req.params.id
      }
    });
    
    if (!categoryData) {
      res.status(404).json({ message: 'No category found with this id.'});
      return;
    }

    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
