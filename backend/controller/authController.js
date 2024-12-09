import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../model/user.js";


export const signup = async (req, res) => {
 try {
   const {email, password, name,username,gender } = req.body;

   // if (!email || !password || !name || username) {
   //   throw new Error("All fields are required");
   // }

   const userAlreadyExists = await User.findOne({ email });


   if (userAlreadyExists) {
     return res
       .status(400)
       .json({ success: false, message: "User already exists" });
   }

   const salt = await bcrypt.genSalt(10);
   const hashedPassword = await bcrypt.hash(password, salt);

   const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
   const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;


   const user = new User({
     email,
     password: hashedPassword,
     name,username,gender,
     imageUrl: gender === "male"? boyProfilePic : girlProfilePic,
   });

   await user.save();

   // jwt
   // generateTokenAndSetCookie(res, user._id);

   const accessToken = jwt.sign(user.toJSON(), process.env.JWT_SECRET, {
     expiresIn: "10d",
   });

  
   res.status(201).json({
     success: true,
     status: 200,
     message: "User created successfully",
     user: {
       ...user._doc,
       password: undefined,
       accessToken: accessToken,
      //  _id: user._id,
      //  name: user.name,
      //  gender: user.gender,
      //  imageUrl: user.imageUrl,
      //  username: user.username
     },
   });
 } catch (error) {
   res.status(400).json({ success: false, message: error.message });
 }
};


export const login = async (req, res) => {
 const { email, password } = req.body;
 try {
   const user = await User.findOne({ email });
   if (!user) {
     return res
       .status(400)
       .json({ success: false, message: "Invalid credentials" });
   }
   const isPasswordValid = await bcrypt.compare(password, user?.password);
   if (!isPasswordValid) {
     return res
       .status(400)
       .json({ success: false, message: "Invalid credentials" });
   }

   // generateTokenAndSetCookie(res, user._id);

   const accessToken = jwt.sign(user.toJSON(), process.env.JWT_SECRET, {
     expiresIn: "10d",
   });

   user.lastLogin = new Date();
   await user.save();

   res.status(200).json({
     success: true,
     message: "Logged in successfully",
     user: {
       ...user._doc,
       password: undefined,
       accessToken: accessToken,
     },
   });
 } catch (error) {
   console.log("Error in login ", error);
   res.status(400).json({ success: false, message: error.message });
 }
};


export const authCallback = async (req, res, next) => {
	try {
		const { id, firstName, lastName, imageUrl } = req.body;
      
    
	
		const user = await User.findOne({ clerkId: id });

		if (!user) {
			// signup
			await User.create({
				clerkId: id,
				name: `${firstName || ""} ${lastName || ""}`.trim(),
				imageUrl,
			});
		}

		res.status(200).json({ success: true });
	} catch (error) {
		console.log("Error in auth callback", error);
		res.status(400).json({ success: false, message: error.message });
	}
};


export const userDetails = async (req, res) => {
  try {
    const userId = req.user._id;
    const isAdmin = req.user.email === process.env.ADMIN_EMAIL; // Check if the user is an admin

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user,
      admin: isAdmin, // Add the admin field
    });
  } catch (error) {
    console.log("Error in userDetails:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};




export const getUsers = async (req, res) => {
  try {
    const { keyword } = req.body;

    // Construct the search filter
    const filter = {};
    if (keyword) {
      filter.$or = [
        { name: { $regex: keyword, $options: "i" } }, // Case-insensitive regex for name
        { email: { $regex: keyword, $options: "i" } }, // Case-insensitive regex for email
      ];
    }

    // Fetch the user data with selected fields
    const users = await User.find(filter).select("name imageUrl clerkId email");

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};