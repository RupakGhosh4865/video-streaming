const express = require('express');
const router = express.Router();
const { protect, roleGuard } = require('../middleware/authMiddleware');
const { getUsersInOrg, updateUserRole, deleteVideo } = require('../controllers/adminController');

// All admin routes are protected by the 'admin' role
router.use(protect);
router.use(roleGuard(['admin']));

router.route('/users')
    .get(getUsersInOrg);

router.route('/users/:id/role')
    .patch(updateUserRole);

router.route('/videos/:id')
    .delete(deleteVideo);

module.exports = router;
