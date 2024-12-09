import mongoose from "mongoose";

export const ConnectDb = async () => {
	try {

		const connectionInstance = await mongoose.connect(process.env.MONGO_URI);
  console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
	} catch (error) {
		console.log("Error connection to MongoDB: ", error.message);
		process.exit(1); // 1 is failure, 0 status code is success
	}
};