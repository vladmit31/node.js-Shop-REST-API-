const express = require('express');
const router = express.Router();

const UserController = require('../controllers/user');
const checkAuth = require('../middleware/check-auth');


router.post('/signup', UserController.users_create_user);

router.delete('/:userId', checkAuth, UserController.users_delete_user);

router.post('/login', UserController.users_authenticate_user);

module.exports = router;