import express from 'express';
import { protectRoute } from '../middleware/auth.middleware';
import { acceptFriendRequest, getMyFriends, getRecommendedUsers, sendFriendRequest } from '../controllers/user.controller';


const router = express.Router();

//apply middleware to all routes
router.use(protectRoute);

router.get("/", getRecommendedUsers);
router.get("/friends", getMyFriends);


router.post("/friend-request/:id", sendFriendRequest ); 
router.put("/friend-request/:id/accept", acceptFriendRequest ); 












export default router;