import { Router } from "express";
import { authCallback, getUsers, login, signup, userDetails } from "../controller/authController.js";
import { authenticateToken } from "../middleware/jwtverify.js";



const router = Router()


router.route('/signup').post(signup)

router.route('/login').post(login) 

router.route('/callback').post(authCallback)

router.route('/userDetails').post(authenticateToken, userDetails)

router.post("/allusers", authenticateToken, getUsers);


export default router;