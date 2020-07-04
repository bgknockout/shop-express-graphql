const { gql } = require('apollo-server')

const typeDefs = gql`
    type User {
        id: ID
        name: String
        lastname: String
        email: String
        createdAt: String
    }

    type Token {
        token: String
    }
    
    type Product {
        id: ID
        name: String
        quantity: Int
        price: Float
        createdAt: String
    }

    type Client {
        id: ID
        name: String
        lastname: String
        company: String
        email: String
        phone: String
        seller: ID
    }

    type Order {
        id: ID
        order: [OrderGroup]
        total: Float
        client: ID
        seller: ID
        date: String
        status: OrderStatus
    }

    type OrderGroup {
        id: ID
        quantity: Int
    }

    type TopClient {
        total: Float
        client: [Client]
    }

    type TopSeller {
        total: Float
        seller: [User]
    }

    input UserInput{
        name: String!
        lastname: String!
        email: String!
        password: String!
    }

    input AuthInput {
        email: String!
        password: String!
    }

    input ProductInput {
        name: String!
        quantity: Int!
        price: Float!
    }

    input ClientInput{
        name: String!
        lastname: String!
        company: String
        email: String!
        phone: String!
    }

    input OrderProductInput {
        id: ID
        quantity: Int
    }

    input OrderInput {
        order: [OrderProductInput]
        total: Float
        client: ID
        status: OrderStatus
    }

    enum OrderStatus {
        PENDIENTE
        COMPLETADO
        CANCELADO
    }

    type Query {
        #Users
        getUser: User

        #Products
        getProducts: [Product]
        getProduct(id: ID!) : Product 

        #Clients
        getClients: [Client]
        getClientSeller: [Client]
        getClient(id: ID!): Client

        #Order 
        getOrders: [Order]
        getOrderSeller: [Order]
        getOrder(id: ID!): Order
        getOrderStatus(status: String!): [Order]

        #Advanced Search
        bestClients: [TopClient]
        bestSellers: [TopSeller]
        searchProduct(text: String!): [Product]
    }

    type Mutation {
        #Users
        newUser(input: UserInput): User
        authUser(input: AuthInput): Token

        #Products
        newProduct(input: ProductInput): Product
        updateProduct( id: ID!, input: ProductInput): Product
        deleteProduct(id: ID!): String
        
        #Clients
        newClient(input: ClientInput): Client
        updateClient(id: ID!, input: ClientInput): Client
        deleteClient(id: ID!) : String

        #Orders
        newOrder(input: OrderInput): Order
        updateOrder(id: ID!, input: OrderInput) : Order
        deleteOrder(id: ID!) : String
    }
`;

module.exports = typeDefs