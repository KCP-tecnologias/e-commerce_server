const { PrismaClient } = require('@prisma/client')
const uuid = require('uuid')
const prisma = new PrismaClient()
const checkers = require('../utils/checkers')

module.exports.insertUser = async (req, res) => {
    const userData = {
        firstName: req.body.firstName,
        middleName: req.body.middleName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password
    }

    const insertValidation = validateInsert(userData)
    if (!insertValidation.ok) {
        return res.status(insertValidation.status).send({
            clientMessage: insertValidation.clientMessage,
            serverMessage: 'Credenciais de cadastro incorretas'
        })
    }

    try {
        const newUser = await prisma.user.create({
            data: {
                userId: uuid.v4(),
                firstName: userData.firstName,
                middleName: userData.middleName,
                lastName: userData.lastName,
                email: userData.email,
                password: userData.password
            }
        })

        res.status(200).send(newUser.userId)
    } catch (e) {
        const errorMessage = getErrorMessageAndStatus(e)
        res.status(errorMessage.status).send({ clientMessage: errorMessage.clientMessage, serverMessage: errorMessage.serverMessage || e })
    }
}

module.exports.findUserById = async (req, res) => {
    try {
        const userFound = await prisma.user.findUnique({
            where: {
                userId: req.params.userId
            }
        })

        res.status(200).send(userFound.firstName)
    } catch (e) {
        const errorMessage = getErrorMessageAndStatus(e)
        res.status(errorMessage.status).send({ clientMessage: errorMessage.clientMessage, serverMessage: errorMessage.serverMessage || e })
    }
}

module.exports.login = async (req, res) => {
    try {
        const userFound = await prisma.user.findFirst({
            where: {
                AND: [
                    { email: req.body.email },
                    { password: req.body.password }
                ]
            }
        })

        userFound
            ? userFound.userStatus === 1
                ? res.status(200).send({ userId: userFound.userId, firstName: userFound.firstName, middleName: userFound.middleName, lastName: userFound.lastName })
                : res.status(403).send({ clientMessage: 'Usuário bloqueado' })
            : res.status(404).send({ clientMessage: 'Usuário não encontrado' })
    } catch (e) {
        const errorMessage = getErrorMessageAndStatus(e)
        res.status(errorMessage.status).send({ clientMessage: errorMessage.clientMessage, serverMessage: errorMessage.serverMessage || e })
    }
}

module.exports.blockUser = async (req, res) => {
    try {
        const userFound = await prisma.user.findUnique({
            where: {
                userId: req.body.userId
            }
        })

        if (!userFound) return res.status(404).send({ clientMessage: 'Usuário não encontrado' })

        const userBlocked = await prisma.user.update({
            where: {
                userId: req.body.userId
            },
            data: {
                userStatus: userFound.userStatus === 1 ? 0 : 1
            }
        })

        res.status(200).send({ clientMessage: `Usuário ${userBlocked.firstName} ${userBlocked.userStatus == 1 ? 'desbloqueado' : 'bloqueado'}` })
    } catch (e) {
        const errorMessage = getErrorMessageAndStatus(e)
        res.status(errorMessage.status).send({ clientMessage: errorMessage.clientMessage, serverMessage: errorMessage.serverMessage || e })
    }
}

const getErrorMessageAndStatus = e => {
    if (e.code == 'P2002') {
        return {
            status: 409,
            clientMessage: `Registro ${e.meta.target} duplicado`
        }
    }

    return {
        status: 500,
        clientMessage: `Erro de servidor: ${e}`
    }
}

const validateInsert = userData => {
    if (!userData.lastName || !userData.firstName) {
        return {
            status: 400,
            clientMessage: 'Primeiro e último nome são obrigatórios'
        }
    }

    if (!checkers.emailCheck(userData.email)) {
        return {
            status: 400,
            clientMessage: 'E-mail informado é inválido'
        }
    }

    if (!checkers.passwordCheck(userData.password)) {
        return {
            status: 400,
            clientMessage: 'A senha não coincide com os padrões requisitados'
        }
    }

    return {
        status: 200,
        ok: true
    }
}