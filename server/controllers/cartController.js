const { PrismaClient } = require('@prisma/client')
const uuid = require('uuid')
const prisma = new PrismaClient()
const checkers = require('../utils/checkers')
const errors = require('../utils/errors')

module.exports.insertCart = async (req, res) => {
    try {
        prisma.cart.create({
            data: {
                cartId: uuid.v4(),
                amount: req.body.amount,
                productProductId: req.body.productId,
                userUserId: req.body.userId
            }
        })
    } catch (e) {
        const errorMessage = errors.getErrorMessageAndStatus(e)
        res.status(errorMessage.status).send({ clientMessage: errorMessage.clientMessage, serverMessage: errorMessage.serverMessage || e })
    }
}