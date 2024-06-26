const { getAll, create, getOne, remove, softDelete, update, setImage, setSizes, setTags } = require('../controllers/product.controller');
const express = require('express');
const { verifyJWT } = require('../utils/VerifyJWT');

const routerProduct = express.Router();

routerProduct.route('/')
    .get(getAll)
    .post(create) //🔒

routerProduct.route('/:id')
    .get(getOne)
    .delete(verifyJWT, remove) //🔒
    .put(verifyJWT, update) //🔒

//Eliminado suave ruta
routerProduct.route('/:id/soft_delete')
    .delete(verifyJWT, softDelete)

routerProduct.route('/:id/images')
    .post(setImage)

routerProduct.route('/:productId/addSize/:sizeId')
    .post(setSizes)

routerProduct.route('/:productId/addTag/:tagId')
    .post(setTags)

module.exports = routerProduct;