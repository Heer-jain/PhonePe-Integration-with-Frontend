const mongoose = require( 'mongoose' );

mongoose.set('strictQuery',false);

const connectToDb = async ()=>{
    try {
        const {connection} = await mongoose.connect(process.env.MONGO_URI);
        if(connection){
            console.log(`Connection to MongoDB ${connection.host}`);
        }
    }
    catch (error) {
        console.log(error);
        process.exit(1);
        }
}   

module.exports = connectToDb;