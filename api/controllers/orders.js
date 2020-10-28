const Order = require("../models/order");
const Product = require("../models/product")

const mongoose = require('mongoose');

exports.orders_get_all = async (req, res, next) => {

    try{
        const docs = await Order.find().select('quantity _id product').populate('product', 'name');
        res.status(200).json({
            count: docs.length,
            orders: docs.map(doc => {
                return {
                    id: doc._id,
                    product: doc.product,
                    quantity: doc.quantity,
                    request: {
                        type: 'GET',
                        url: 'http://localhost:' + process.env.PORT + '/orders/' + doc.id
                    }
                }
            })
        })
    }
    catch(err){
        res.status(500).json({error: err})
    }
};

exports.orders_create_order = async (req, res, next) => {

    try{
        const product = await Product.findById(req.body.productId);
        if(!product){
            return res.status(404).json({message: "Product not found"})
        }
        const order = new Order({
            _id : mongoose.Types.ObjectId(),
            quantity: req.body.quantity,
            product : req.body.productId
        });

        const result = await order.save();

        res.status(201).json({
            message: "Order stored",
            createdOrder:{
                _id: result._id,
                product: result.product,
                quantity: result.quantity
            },
            request:{
                type: "GET",
                url: 'http://localhost:' + process.env.PORT + '/orders/'+ result._id
            }
        })

    }
    catch(err){
        res.status(500).json({error: err })
    }
};

exports.orders_get_order = async (req, res, next) => {

    try{
        const result = await Order.findById(req.params.orderId).select('quantity product _id').populate('product')
        res.status(200).json({
            message: "Order fetched successfully",
            order: result,
            request: {
                type:'GET',
                url: 'http://localhost:' + process.env.PORT + '/orders'
            }
        })
    }
    catch(err)
    {
        res.status(500).json({
            error : err
        })
    }
};

exports.orders_delete_order = async (req, res, next) => {

    const id = req.params.orderId;

    try{
        const order = await Order.findById(id);

        if(!order){
            res.status(404).json({message: 'Order not found'});
        }

        await Order.remove({_id: id});
        res.status(200).json({
            message: "Order deleted",
            request: {
                type: 'POST',
                url: 'http://localhost:' + process.env.PORT + '/orders',
                body: {
                    productId: 'ID',
                    quantity: 'Number'
                }
            }
        })
    }
    catch(err){
        res.status(500).json({error: err})
    }
};