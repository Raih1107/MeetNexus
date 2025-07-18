import FriendRequest from "../models/FriendRequest.js";
import User from "../models/User.js";


export async function getRecommendedUsers(req,res){
    try {
        const currentUserID = req.user.id;
        const currentUser = req.user;

        const recommendedUsers = await User.find({
            $and:[
                {_id: {$ne: currentUserID}},
                {_id: {$nin: currentUser.friends}},
                {isOnboarded: true}
            ]
        })

        res.status(200).json(recommendedUsers);

    } catch (error) {
        console.error("Error fetching recommended users:", error);
        res.status(500).json({message: "Internal server error in getRecommendedUsers"});
    }
}


export async function getMyFriends(req,res){
    try {
        const user = await User.findById(req.user.id)
        .select("friends")
        .populate("friends", "fullName profilePic nativeLanguage learningLanguage ");

        res.status(200).json(user.friends);



    } catch (error) {
        console.error("Error in getMyFriends controller", error.message);
        res.status(500).json({message: "Internal server error in getMyFriends"});
    }
}


export async function sendFriendRequest(req,res){

    try {
        const myId = req.user.id;
        const {id:recipientId} = req.params;
        
        //prevent sending friend request to self
        if(myId === recipientId){
            return res.status(400).json({message: "You cannot send a friend request to yourself"});
        }

        const recipient = await User.findById(recipientId);
        if(!recipient){
            return res.status(404).json({message: "Recipient not found"});
        }

        if(recipient.friends.includes(myId)){
            return res.status(400).json({message: "You are already friends with this user"});
        }

        const existingRequest = await User.findOne({
            $or:[
                {sender: myId, recipient: recipientId},
                {sender: recipientId, recipient: myId},
            ]
        });

        if(existingRequest){
            return res.status(400).json({message: "Friend request already exists between you and this user"});
        }

        const friendRequest = await FriendRequest.create({
            sender: myId,
            recipient: recipientId,

        })

        res.status(201).json(friendRequest);

    } catch (error) {
        
    }
}


export async function acceptFriendRequest(req,res){
    
    try {
        const {id:requestId} = req.params;

        const friendRequest = await FriendRequest.findById(requestId);

        if(!friendRequest){
            return res.status(404).json({message: "Friend request not found"});
        }

        if(friendRequest.recipient.toString() !== req.user.id){
            return res.status(403).json({message: "You are not authorized to accept this friend request"});
        }

        friendRequest.status = "accepted";
        await friendRequest.save();

        //$addToSet ensures that the user is added to the friends array only if they are not already present
        //This prevents duplicates in the friends array

        await User.findByIdAndUpdate(friendRequest.sender, {
            $addToSet: { friends: friendRequest.recipient }
        });

        await User.findByIdAndUpdate(friendRequest.recipient, {
            $addToSet: { friends: friendRequest.sender }    
        });

    } catch (error) {
        console.error("Error accepting friend request:", error);
        res.status(500).json({message: "Internal server error in acceptFriendRequest"});
    }
}

export async function getFriendRequests(req,res){
    try {
        const incomingRequests = await FriendRequest.find({
            recipient: req.user.id,
            status: "pending",
        }).populate("sender", "fullName profilePic nativeLanguage learningLanguage");

        const acceptedReqs = await FriendRequest.find({
            recipient: req.user.id,
            status: "accpted",
        }).populate("recipient", "fullName profilePic");

        res.status(200).json({ incomingRequests, acceptedReqs})

    } catch (error) {
        console.error("Error fetching friend requests:", error);
        res.status(500).json({message: "Internal server error in getFriendRequests"});
    }
}


export async function getOutgoingFriendReqs(req,res){
    try {
        
        const outgoingRequests = await FriendRequest.find({
            sender : req.user.id ,
            status: "pending"
        }).populate("recipient", "fullName profilePic nativeLanguage learningLanguage");

        res.status(200).json(outgoingRequests);

    } catch (error) {
        console.error("Error fetching outgoing friend requests:", error);
        res.status(500).json({message: "Internal server error in getOutgoingFriendReqs"});
        
    }
}