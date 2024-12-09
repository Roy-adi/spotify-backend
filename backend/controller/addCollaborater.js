import { CollaborationRequest } from "../model/collaborater.model.js";
import { Playlist } from "../model/Playlist.js";
import mongoose from "mongoose";
import { User } from "../model/user.js";

export const sendCollaborationRequest = async (req, res) => {
 try {
   const { playlistId, collaboratorUsername } = req.body;
   const ownerId = req.user._id;

   const collaborator = await User.findOne({ username: collaboratorUsername });

   if (!collaborator) {
     return res.status(404).json({ message: "Collaborator not found" });
   }

   const newRequest = new CollaborationRequest({
     playlistId,
     ownerId,
     collaboratorId: collaborator._id,
   });

   await newRequest.save();

   res.status(200).json({ message: "Collaboration request sent", request: newRequest });
 } catch (error) {
   console.error(error);
   res.status(500).json({ message: "Server error, please try again later" });
 }
};


export const respondToCollaborationRequest = async (req, res) => {
 try {
   const { requestId, response } = req.body; // response can be 'accepted' or 'rejected'
   const collaboratorId = req.user._id;

   const request = await CollaborationRequest.findById(requestId);

   if (!request || !request.collaboratorId.equals(collaboratorId)) {
     return res.status(404).json({ message: "Request not found or unauthorized" });
   }
    
   if(request.status === 'accepted') {
     return res.status(400).json({ message: "This collaboration request has already been accepted" });
   }

   const request_id = new mongoose.Types.ObjectId(requestId);

   let reqStatusUpdate = '';

   if (response === 'accepted') {
    
    reqStatusUpdate = await CollaborationRequest.findByIdAndUpdate(request_id, { status: 'accepted' });

    const playlistID = new mongoose.Types.ObjectId(request.playlistId);
     const playlist = await Playlist.findOneAndUpdate({ _id: playlistID },{ $push: { collaborators: collaboratorId } });
   }else{
    reqStatusUpdate = await CollaborationRequest.findByIdAndUpdate(request_id, { status: 'rejected' });
   }

   res.status(200).json({ message: `Collaboration request ${response}`, reqStatusUpdate });
 } catch (error) {
   console.error(error);
   res.status(500).json({ message: "Server error, please try again later" });
 }
};





export const getCollaborationRequestsList = async (req, res) => {
 try {
   const userId = new mongoose.Types.ObjectId(req.user._id);


   const requests = await CollaborationRequest.aggregate([
     {
       $match: { collaboratorId: userId }
     },
     {
       $lookup: {
         from: 'users', // The User collection
         localField: 'ownerId',
         foreignField: '_id',
         as: 'ownerInfo'
       }
     },
     {
      $unwind: '$ownerInfo'
    },
     {
       $lookup: {
         from: 'playlists', // The Playlist collection
         localField: 'playlistId',
         foreignField: '_id',
         as: 'playlistInfo'
       }
     },     
     {
       $unwind: '$playlistInfo'
     },
     {
       $group: {
         _id: '$_id',
         status: { $first: '$status' },
         owner_name: { $first: '$ownerInfo.name' },
         playlist_name: { $first: '$playlistInfo.playlistName' },
         playlist_image: { $first: '$playlistInfo.playlistImg' }
       }
     }
   ]);

   res.status(200).json({ requests });
 } catch (error) {
   console.error(error);
   res.status(500).json({ message: "Server error, please try again later" });
 }
}
