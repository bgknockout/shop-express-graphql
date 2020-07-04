const { ApolloServer, gql } = require('apollo-server');
const typeDefs = require('./db/schema');
const resolvers = require('./db/resolvers');
const jwt = require('jsonwebtoken')
const connectDB = require('./config/db');
require('dotenv').config({ path: 'env.env' })

connectDB()

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
        const token = req.headers['authorization'] || ''

        if (token) {
            try {
                const user = jwt.verify(token.replace('Bearer ', ''), process.env.SECRET_KEY)
                return {
                    user
                }
            } catch (err) {
                console.log("Error al obtener token")
            }
        }
    }
})

server.listen().then(({ url }) => {
    console.log(`Servidor corriendo en ${url}`)
})

