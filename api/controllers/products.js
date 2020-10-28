const Product = require('../models/product');

const mongoose = require('mongoose');

exports.products_get_all = async (req, res, next) => {
    try{
        const docs = await Product.find().select('name price _id productImage');
        const response = {
            count: docs.length,
            products: docs.map(doc => {
                return {
                    name: doc.name,
                    price: doc.price,
                    productImage: doc.productImage,
                    _id: doc._id,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:'+process.env.PORT+'/products/' + doc._id
                    }
                }
            })
        };
        
        res.status(200).json({response});

    }
    catch(err){
        console.log(err);
            res.status(500).json({error: err})
    }
};

exports.products_create_product = async(req, res, next) => {

    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    });

    try{
        const result = await product.save();
        res.status(201).json({
            message: 'Created product successfully',
            createdProduct: {
                name : result.name,
                price: result.price,
                _id : result._id,
                productImage: result.productImage,
                request: {
                    type: 'GET',
                    url: 'http://localhost:' + process.env.PORT+ '/' + result._id
                }
            }
        })
    }
    catch(err){
        res.status(500).json({error: err})
    }
};

exports.products_get_product = async (req, res, next) => {
    const id = req.params.productId;

    try{
        const doc = await Product.findById(id).select('name price _id productImage');
        if(doc)
        {
            res.status(200).json({
                product: doc,
                request: {
                    type: 'GET',
                    description: 'Get all products',
                    url: 'http://localhost:' + process.env.PORT + '/products'
                    }
            })
        }
        else {
            res.status(404).json({message: "No json object found for provided id"})
        }
    }
    catch(err){
        res.status(500).json({error: err})
    }
};

exports.products_update_product = async (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};
    const availableProperties = Object.keys(Product.schema.paths);

    for (const ops of req.body){
        if(availableProperties.includes(ops.propName))
            updateOps[ops.propName] = ops.value;
    }

    if(Object.keys(updateOps).length === 0 && updateOps.constructor === Object)
    {
        res.status(500).json({message: "Body is empty, no update operations found"})
    }

    try{
        await Product.update({_id: id}, {$set: updateOps});
        res.status(200).json({
            message: "Product updated",
            request: {
                type: 'GET',
                url: 'http://localhost:' + process.env.PORT + '/products/'+ id
            }
        });
    }
    catch(err){
        res.status(500).json({error: err})
    }

};

exports.products_delete_product = async (req, res, next) => {
    const id = req.params.productId;
    
    try{
        const product = await Product.findById(id);

        if(!product){
            res.status(404).json({message: "Product not found"})
        }

        await Product.remove({_id: id});
        res.status(200).json({
            message: "Product deleted",
            request: {
                type: 'POST',
                url: 'http://localhost:' + process.env.PORT + '/products',
                body: { name: 'String', price: 'Number'}
            }
        })
    }
    catch(err){
        res.status(500).json({error: err});
    }
};