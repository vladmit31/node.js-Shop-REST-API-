const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.users_create_user = async (req, res, next) => {
    
    try{
        const user = await User.find({email: req.body.email});
        if(user.length >= 1){
            return res.status(409).json({
                message: 'Mail exists'
            })
        }
        else{
            const hash = await bcrypt.hash(req.body.password, 10);

            const user = new User({
                _id: new mongoose.Types.ObjectId(),
                email:  req.body.email,
                password: hash
            });

            await user.save();

            res.status(201).json({message: 'User created'});
        }
    }
    catch(err){
        res.status(500).json({error: err});
    }
};

exports.users_delete_user = async (req, res, next) => {

    try{
        await User.remove({_id: req.params._id});
        res.status(200).json({message: 'User deleted'});
    }
    catch(err){
        res.status(500).json({error: err})
    }
};

exports.users_authenticate_user = async (req, res, next) => {

    try{
        const user = await User.find({email: req.body.email});
        if(user.length < 1){
            return res.status(401).json({message: "Auth failed"});
        }
        else{
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if(err)
                    return res.status(401).json({message: "Auth failed"});
                if(result){
                    const token = jwt.sign(
                        {
                            email: user[0].email,
                            userId: user[0]._id,
                            role: user[0].role
                        }, 
                        process.env.JWT_KEY, 
                        {
                            expiresIn: "1h"
                        });
                    return res.status(200).json({message: "Auth successful", token: token});
                }
                    

                res.status(401).json({message: "Auth failed"});
            })
        }
    }
    catch(err){
        res.status(500).json({error: err})
    }
};