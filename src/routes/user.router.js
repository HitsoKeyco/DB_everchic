const { getAll, create, remove, update, login, verifyEmail } = require('../controllers/user.controller');
const express = require('express');
const { verifyJWT } = require('../utils/VerifyJWT');

const routerUser = express.Router();

routerUser.route('/')
    .get(getAll) 
    .post(create);

routerUser.route('/login')
    .post(login)

routerUser.route('/verify/:id')
    .put(verifyEmail)

routerUser.route('/:id')    
    .delete(verifyJWT,remove) 
    .put(verifyJWT,update); 

module.exports = routerUser;