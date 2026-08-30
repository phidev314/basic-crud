import { response } from "express";
import User from "../model/UserModel.js"

export const getUsers = async(req, res) => {
    try {
        const response = await User.findAll();
        res.status(200).json(response);
    } catch (error) {
        console.log(Error.massage);
    }
}

export const getUsersById = async(req, res) => {
    try {
        const response = await User.findOne({
            where: {
                id: req.params.id
            }
        });
        res.status(200).json(response);
    } catch (error) {
        console.log(Error.massage);
    }
}


export const createUser = async(req, res) => {
    console.log(req.body)
    try {
       await User.create(req.body);
       res.status(201).json({msg: "User Created"});
    } catch (error) {
        console.log(Error.massage);
    }
}


export const updateUser = async(req, res) => {
    try {
       await User.update(req.body,{
        where:{
            id: req.params.id
        }
       });
       res.status(200).json({msg: "User Updated"});
    } catch (error) {
        console.log(Error.massage);
    }
}


export const deleteUser = async(req, res) => {
    try {
       await User.delete({
        where:{
            id: req.params.id
        }
       });
       res.status(200).json({msg: "User Deleted"});
    } catch (error) {
        console.log(Error.massage);
    }
}