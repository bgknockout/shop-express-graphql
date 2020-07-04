const mongoose = require('mongoose')
require('dotenv').config({ path: 'env.env' })

const connectDB = async () => {

    try {
        await mongoose.connect(process.env.DB_MONGO, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
        })
        console.log('Conectado')
    } catch (err) {
        console.log('Error')
        console.log(err)
        process.exit(1)
    }

}

module.exports = connectDB;