const User = require('../models/User');
const Product = require('../models/Product');
const Client = require('../models/Client');
const Order = require('../models/Order');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
require('dotenv').config({ path: 'env.env' })

const createToken = (user, key, expiresIn) => {
    console.log(user)
    const { id, email, name, lastname } = user
    return jwt.sign({ id, email, name, lastname }, key, { expiresIn })
}

// Resolvers
const resolvers = {
    Query: {
        getUser: async (_, {}, ctx) => {
            return ctx.user;
        },
        getProducts: async () => {
            try {
                const products = await Product.find({})
                return products
            } catch (err) {
                console.log(err)
            }
        },
        getProduct: async (_, { id }) => {
            const product = await Product.findById(id)

            if (!product) {
                throw new Error('Producto no encontrado')
            }

            return product
        },
        // Client
        getClients: async () => {
            try {
                const clients = await Client.find({})
                return clients
            } catch (err) {
                console.log('Error')
            }
        },
        getClientSeller: async (_, { }, ctx) => {
            try {
                const clients = await Client.find({ seller: ctx.user.id.toString() })
                return clients
            } catch (err) {
                console.log('Error')
            }
        },
        getClient: async (_, { id }, ctx) => {
            const client = await Client.findById(id)

            if (!client) {
                throw new Error('Cliente no encontrado')
            }

            if (client.seller.toString() !== ctx.user.id) {
                throw new Error('No tienes acceso a ver esta informacion')
            }

            return client
        },
        getOrders: async () => {
            try {
                const orders = Order.find({})

                return orders
            } catch (err) {
                console.log(err)
            }
        },
        getOrderSeller: async (_, { }, ctx) => {
            try {
                const orders = await Order.find({ seller: ctx.user.id })
                return orders
            } catch (err) {
                console.log(err)
            }
        },
        getOrder: async (_, { id }, ctx) => {
            const order = await Order.findById(id)

            if (!order) {
                throw new Error('Pedido no encontrado')
            }

            if (order.seller.toString() !== ctx.user.id) {
                throw new Error('No tienes las credenciales')
            }

            return order
        },
        getOrderStatus: async (_, { status }, ctx) => {
            const orders = await Order.find({ seller: ctx.user.id, status })

            return orders
        },
        // Advanced
        bestClients: async () => {
            const clients = await Order.aggregate([
                { $match: { status: "COMPLETADO" } },
                {
                    $group: {
                        _id: "$client",
                        total: { $sum: "$total" }
                    }
                },
                {
                    $lookup: {
                        from: "clients",
                        localField: "_id",
                        foreignField: "_id",
                        as: "client"
                    }
                },
                {
                    $limit: 10
                },
                {
                    $sort: { total: -1 }
                }
            ])

            return clients
        },
        bestSellers: async () => {
            const sellers = await Order.aggregate([
                { $match: { status: "COMPLETADO" } },
                {
                    $group: {
                        _id: "$seller",
                        total: { $sum: "$total" }
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'seller'
                    }
                },
                {
                    $limit: 3
                },
                {
                    $sort: { total: -1 }
                }
            ])

            return sellers
        },
        searchProduct: async (_, { text }) => {
            const products = await Product.find({ $text: { $search: text } }).limit(10)

            return products
        }
    },
    Mutation: {
        newUser: async (_, { input }) => {


            const { email, password } = input

            // check if user is already register
            const userExist = await User.findOne({ email })

            if (userExist) {
                throw new Error('El usuario ya está registrado')
            }
            // hash password
            const salt = await bcrypt.genSalt(10);
            input.password = await bcrypt.hash(password, salt)

            try {
                const user = new User(input)
                user.save()
                return user
            } catch (err) {
                console.log(err)
            }
            // save in database
        },
        authUser: async (_, { input }) => {
            const { email, password } = input
            // if user exist
            const userExist = await User.findOne({ email })
            if (!userExist) {
                throw new Error('El usuario no existe')
            }

            // check if correct password
            const validPassword = await bcrypt.compare(password, userExist.password)
            if (!validPassword) {
                throw new Error('El password es Incorrecto')
            }

            return {
                token: createToken(userExist, process.env.SECRET_KEY, '24h')
            }
        },
        newProduct: async (_, { input }) => {
            try {
                const product = new Product(input)

                // save in database
                const result = await product.save()

                return result
            } catch (err) {
                console.log(err)
            }
        },
        updateProduct: async (_, { id, input }) => {
            let product = await Product.findById(id)

            if (!product) {
                throw new Error('Producto no encontrado')
            }

            // save in db
            product = await Product.findOneAndUpdate({ _id: id }, input, { new: true })

            return product
        },
        deleteProduct: async (_, { id }) => {
            const product = await Product.findById(id)

            if (!product) {
                throw new Error('Producto no encontrado')
            }

            await Product.findOneAndDelete({ _id: id });

            return "Producto Eliminado"
        },
        // Client
        newClient: async (_, { input }, ctx) => {
            const { email } = input

            const client = await Client.findOne({ email })

            if (client) {
                throw new Error('El cliente ya está registrado')
            }

            const newClient = new Client(input)

            newClient.seller = ctx.user.id

            try {

                const result = await newClient.save()

                return result
            } catch (err) {
                console.log(err)
            }
        },
        updateClient: async (_, { id, input }, ctx) => {
            let client = await Client.findById(id)

            if (!client) {
                throw new Error('El cliente no existe')
            }

            if (client.seller.toString() !== ctx.user.id) {
                throw new Error('No tienes acceso para actualizar esta informacion')
            }

            client = await Client.findOneAndUpdate({ _id: id }, input, { new: true })

            return client
        },
        deleteClient: async (_, { id, input }, ctx) => {
            let client = await Client.findById(id)

            if (!client) {
                throw new Error('El cliente no existe')
            }

            if (client.seller.toString() !== ctx.user.id) {
                throw new Error('No tienes acceso para actualizar esta informacion')
            }

            await Client.findOneAndDelete({ _id: id })
            return "Cliente Eliminado"
        },
        newOrder: async (_, { input }, ctx) => {

            const { client } = input

            let clientExist = await Client.findById(client)

            if (!clientExist) {
                throw new Error('El cliente no existe')
            }

            if (clientExist.seller.toString() !== ctx.user.id) {
                throw new Error('No tienes acceso para actualizar esta informacion')
            }

            for await (const article of input.order) {
                const { id } = article

                const product = await Product.findById(id);

                if (article.quantity > product.quantity) {
                    throw new Error(`El articulo: ${product.name} excede la cantidad disponible`)
                } else {
                    product.quantity = product.quantity - article.quantity

                    await product.save()
                }
            }

            const newOrderProducts = new Order(input)

            newOrderProducts.seller = ctx.user.id

            const result = await newOrderProducts.save()

            return result
        },
        updateOrder: async (_, { id, input }, ctx) => {
            const { client } = input

            const orderExist = await Order.findById(id)

            if (!orderExist) {
                throw new Error('El pedido no existe')
            }

            const clientExist = await Client.findById(client)

            if (!clientExist) {
                throw new Error('El cliente no existe')
            }

            if (clientExist.seller.toString() !== ctx.user.id) {
                throw new Error('No tienes las credenciales')
            }

            if (input.pedido) {
                for await (const article of input.order) {
                    const { id } = article

                    const product = await Product.findById(id);
                    console.log("estos", article.quantity)
                    if (article.quantity > product.quantity) {
                        throw new Error(`El articulo: ${product.name} excede la cantidad disponible`)
                    } else {
                        product.quantity = product.quantity - article.quantity

                        await product.save()
                    }
                }
            }

            const result = await Order.findOneAndUpdate({ _id: id }, input, { new: true })
            return result
        },
        deleteOrder: async (_, { id }, ctx) => {
            const order = await Order.findById(id)

            if (!order) {
                throw new Error(`El pedido no existe`)
            }

            if (order.seller.toString() !== ctx.user.id) {
                throw new Error(`No tienes las credenciales`)
            }

            await Order.findOneAndDelete({ _id: id })

            return "Pedido eliminado"
        }
    }
}

module.exports = resolvers