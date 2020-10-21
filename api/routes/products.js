const express = require('express');
const router = express.Router();
const multer = require('multer');
const checkAuth = require('../middleware/check-auth');

const ProductsController = require("../controllers/products")

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './uploads/');
    },
    filename: function(req, file, cb){
        const now = new Date().toISOString();
        const date = now.replace(/:/g, '-').substring(0, 10); 
        cb(null, date + "_" + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    // reject file
    if(file.mimetype === 'image/jpeg' || file.mimetype == 'image/png'){
        cb(null, true)
    } 
    else{
        cb(new Error('File type must be of type jpeg or png. File not saved'), false)
    }    
};

const upload = multer({
    storage: storage, 
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB
    },
    fileFilter: fileFilter 
});

router.get('/', ProductsController.products_get_all);

router.post('/', checkAuth, upload.single('productImage'), ProductsController.products_create_product);

router.get('/:productId', ProductsController.products_get_product);

router.patch('/:productId', checkAuth, ProductsController.products_update_product);

router.delete('/:productId', checkAuth, ProductsController.products_delete_product);

module.exports = router;