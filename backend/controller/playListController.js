
import { v2 as cloudinary } from "cloudinary";
import { Playlist } from "../model/Playlist.js";
import { Song } from "../model/song.js";
import mongoose from "mongoose";


export const createPlaylist = async (req, res) => {
  try {
    const { playlistName } = req.body;
    const ownerId = req.user._id; // Assuming req.user contains the logged-in user's details

    let playlistImg = null;
    if (req.files && req.files.image) {
      const imageFile = req.files.image[0];
      const imgUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: 'image',
      });
      playlistImg = imgUpload.secure_url;
    }

    const newPlaylist = new Playlist({
      playlistName,
      playlistImg : playlistImg,
      owner: ownerId,
    });

    await newPlaylist.save();

    res.status(201).json({ message: "Playlist created successfully", playlist: newPlaylist });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};


export const addSongToPlaylist = async (req, res) => {
  try {
    const { playlistId, songId } = req.body;
    const userId = req.user._id;

    // Find the playlist and check authorization
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    // Check if the user is the owner or a collaborator
    if (!playlist.owner.equals(userId) && !playlist.collaborators.includes(userId)) {
      return res.status(403).json({ message: "You are not authorized to modify this playlist" });
    }

    // Check if the song exists
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    // Add song to playlist if not already present
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
      playlistId,
      { $addToSet: { songs: songId } }, // $addToSet ensures no duplicates
      { new: true } // Return the updated document
    );

    return res.status(200).json({ message: "Song added to playlist", playlist: updatedPlaylist });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const removeSongFromPlaylist = async (req, res) => {
  try {
    const { playlistId, songId } = req.body;
    const userId = req.user._id;

    // Find the playlist and check authorization
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    // Check if the user is the owner or a collaborator
    if (!playlist.owner.equals(userId) && !playlist.collaborators.includes(userId)) {
      return res.status(403).json({ message: "You are not authorized to modify this playlist" });
    }

    // Check if the song exists in the playlist
    if (!playlist.songs.includes(songId)) {
      return res.status(404).json({ message: "Song not found in playlist" });
    }

    // Remove the song from the playlist
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
      playlistId,
      { $pull: { songs: songId } }, // $pull removes the songId from the songs array
      { new: true } // Return the updated document
    );

    return res.status(200).json({ message: "Song removed from playlist", playlist: updatedPlaylist });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};





export const getPlaylistsByOwner = async (req, res) => {
  try {
    const ownerId = req.user._id; // Assuming `req.user` is populated by authentication middleware

    // Fetch playlists for the owner
    const playlists = await Playlist.find({ owner: ownerId })
      .populate("songs", "title duration") // Populate songs if needed
      .populate("collaborators", "name email") // Populate collaborators if needed
      .exec();

    res.status(200).json({ message: "Playlists fetched successfully", playlists });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};




export const getPlaylistsByOwnerOrCollaborator = async (req, res) => {
  try {
    const ownerId = req.user._id; // Current user ID
    const owner_id = new mongoose.Types.ObjectId(ownerId);

    console.log("ownerId:", ownerId);

    const result = await Playlist.aggregate([
      {
        $facet: {
          ownedPlaylists: [
            {
              $match: {
                owner: owner_id, // Match playlists owned by the user
              },
            },
            {
              $project: {
                playlistName: 1,
                playlistImg: 1,
                owner: 1,
                createdAt:1 
              },
            },
          ],
          collaborationRequests: [
            {
              $lookup: {
                from: "collaborationrequests",
                let: { playlist_owner: owner_id },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          { $eq: ["$collaboratorId", "$$playlist_owner"] },
                          { $eq: ["$status", "accepted"] },
                        ],
                      },
                    },
                  },
                  {
                    $lookup: {
                      from: "playlists", // Join with playlists collection
                      localField: "playlistId",
                      foreignField: "_id",
                      as: "playlistDetails",
                    },
                  },
                  { $unwind: "$playlistDetails" },
                  {
                    $project: {
                      _id: "$playlistDetails._id",
                      playlistName: "$playlistDetails.playlistName",
                      playlistImg: "$playlistDetails.playlistImg",
                      ownerId: "$ownerId",
                      collaboratorId: "$collaboratorId",
                      status: "$status",
                      createdAt: "$createdAt",
                    },
                  },
                ],
                as: "collaborationRequests",
              },
            },
            { $unwind: "$collaborationRequests" },
            {
              $group: {
                _id: "$collaborationRequests._id",
                playlistName: { $first: "$collaborationRequests.playlistName" },
                playlistImg: { $first: "$collaborationRequests.playlistImg" },
                ownerId: { $first: "$collaborationRequests.ownerId" },
                collaboratorId: { $first: "$collaborationRequests.collaboratorId" },
                status: { $first: "$collaborationRequests.status" },
                createdAt: { $first: "$collaborationRequests.createdAt" },
              },
            },
          ],
        },
      },
    ]);

    const { ownedPlaylists, collaborationRequests } = result[0];

    res.status(200).json({
      message: "Playlists fetched successfully",
      playlistData:{
        ownedPlaylists,
        collaborationPlaylist  : collaborationRequests,
      }
       
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};



export const updatePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params; // Playlist ID from URL params
    const { collaborators, songs } = req.body; // Collaborators and songs arrays

    // Validate inputs
    if (!Array.isArray(collaborators) || !Array.isArray(songs)) {
      return res.status(400).json({ message: "Collaborators and songs must be arrays" });
    }

    // Find the playlist by ID and ensure the user is the owner
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to update this playlist" });
    }

    // Update collaborators (append unique index-wise IDs)
    const existingCollaboratorsSet = new Set(playlist.collaborators.map((collaboratorId) => collaboratorId.toString()));
    collaborators.forEach((collaboratorId, index) => {
      if (!existingCollaboratorsSet.has(collaboratorId)) {
        playlist.collaborators.push(collaboratorId);
      }
    });

    // Update songs (append unique index-wise IDs)
    const existingSongsSet = new Set(playlist.songs.map((songId) => songId.toString()));
    songs.forEach((songId, index) => {
      if (!existingSongsSet.has(songId)) {
        playlist.songs.push(songId);
      }
    });

    await playlist.save();

    res.status(200).json({ message: "Playlist updated successfully", playlist });
  } catch (error) {
    console.error("Error updating playlist:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};



export const getOwnerPlaylistDetails = async (req, res) => {
  try {
    const { playlistId } = req.params;

    const ownerId = req.user._id; 

    // Find the playlist for the given owner
    const playlistDetails = await Playlist.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(playlistId),
          owner: new mongoose.Types.ObjectId(ownerId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "ownerDetails",
        },
      },
      {
        $unwind: '$ownerDetails',
      },
      {
        $lookup: {
          from: "users",
          localField: "collaborators",
          foreignField: "_id",
          as: "collaboratorDetails",
        },
      },
      {
        $lookup: {
          from: "songs",
          localField: "songs",
          foreignField: "_id",
          as: "songDetails",
        },
      },
      {
        $project: {
          playlistName: 1,
          playlistImg: 1,
          ownerDetails: { _id: 1, name: 1, email: 1 },
          collaboratorDetails: { _id: 1, name: 1, email: 1 },
          songDetails: 1, // Include all fields of songDetails
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);
    

    if (!playlistDetails || playlistDetails.length === 0) {
      return res.status(404).json({ message: "Playlist not found for this owner" });
    }

    res.status(200).json({ message: "Playlist details fetched successfully", playlist: playlistDetails[0] });
  } catch (error) {
    console.error("Error fetching playlist details:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};


export const getSongs = async (req, res) => {
  try {
    const { keyword, page = 1, limit = 10 } = req.body;

    // Build the query object
    const query = keyword
      ? {
          $or: [
            { songName: { $regex: keyword, $options: "i" } },
            { description: { $regex: keyword, $options: "i" } },
            { singerName: { $regex: keyword, $options: "i" } },
          ],
        }
      : {};

    // Calculate pagination parameters
    const skip = (page - 1) * limit;

    // Fetch total count of songs
    const totalSongs = await Song.countDocuments(query);

    // Fetch songs with pagination and populate the album field
    const songs = await Song.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("album"); // Populate all fields of the referenced Album

    res.status(200).json({
      success: true,
      totalSongs,
      totalPages: Math.ceil(totalSongs / limit),
      currentPage: page,
      songs,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};




export const editPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { playlistName, removeCollaborators } = req.body;

   

    // Find the playlist by ID
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    // Check if the requester is the owner of the playlist
    // if (String(playlist.owner) !== String(req.user._id)) {
    //   return res.status(403).json({ message: 'You are not authorized to edit this playlist' });
    // }

    // Update playlist name if provided
    if (playlistName) {
      playlist.playlistName = playlistName;
    }

    // Update playlist image if provided
    if (req.files && req.files.image) {
      try {
        const imageFile = req.files.image[0]; // Ensure this indexing is valid
        const imgUpload = await cloudinary.uploader.upload(imageFile.path, {
          resource_type: 'image',
        });
        playlist.playlistImg = imgUpload.secure_url;
      } catch (uploadError) {
        console.error(uploadError);
        return res.status(500).json({ message: 'Image upload failed' });
      }
    }

    // Remove collaborators if specified
    if (Array.isArray(removeCollaborators) && removeCollaborators.length > 0) {
      playlist.collaborators = playlist.collaborators.filter(
        (collaborator) => !removeCollaborators.includes(String(collaborator))
      );
    }

    // Save the updated playlist
    await playlist.save();

    res.status(200).json({ message: 'Playlist updated successfully', playlist });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while updating the playlist' });
  }
};


