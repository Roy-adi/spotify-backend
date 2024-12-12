import { v2 as cloudinary } from "cloudinary";
import { Song } from "../model/song.js";
import { Album } from "../model/album.js";
import { User } from "../model/user.js";

export const addSong = async (req, res) => {
  try {
    const { songName, description, singerName, album,duration } = req.body;

    // Check if files exist
    if (!req.files || !req.files.audio || !req.files.image) {
      return res
        .status(400)
        .json({ message: "Please upload both audio and image files" });
    }

    const audioFile = req.files.audio[0];
    const imageFile = req.files.image[0];

    // Upload files to Cloudinary
    const audioUpload = await cloudinary.uploader.upload(audioFile.path, {
      resource_type: "video",
    });
    const imgUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });

    // Create a new song document
    const newSong = new Song({
      songName,
      description,
      singerName,
      album,
      audio: audioUpload.secure_url,
      image: imgUpload.secure_url,
      duration
    });

    await newSong.save();
    res.status(201).json({ message: "Song added successfully", song: newSong });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

export const updateSong = async (req, res) => {
  try {
    const { id } = req.params;
    const { songName, description, singerName, album,duration } = req.body;

    // Find the existing song
    const existingSong = await Song.findById(id);
    if (!existingSong) {
      return res.status(404).json({ message: "Song not found" });
    }

    // Update details if provided
    if (songName) existingSong.songName = songName;
    if (description) existingSong.description = description;
    if (singerName) existingSong.singerName = singerName;
    if (album) existingSong.album = album;
    if (duration) existingSong.duration = duration;

    // Check if new files are provided and upload them
    if (req.files?.audio?.[0]) {
      const audioFile = req.files.audio[0];

      // Upload new audio to Cloudinary
      const audioUpload = await cloudinary.uploader.upload(audioFile.path, {
        resource_type: "video",
      });
      existingSong.audio = audioUpload.secure_url;
    }

    if (req.files?.image?.[0]) {
      const imageFile = req.files.image[0];

      // Upload new image to Cloudinary
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      existingSong.image = imageUpload.secure_url;
    }

    // Save the updated song
    await existingSong.save();

    res
      .status(200)
      .json({ message: "Song updated successfully", song: existingSong });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

export const updateAlbum = async (req, res) => {
  try {
    const { id } = req.params;

    // Extract album details
    const { albumName, albumDescription, albumColor } = req.body;

    // console.log(req.body, 'req.body');

    const addSongs = req.body.addSongs
      ? req.body.addSongs.split(",").map((songId) => songId.trim())
      : [];

    // console.log(addSongs, removeSongs, 'addSongs removeSongs');

    // Find the existing album
    const existingAlbum = await Album.findById(id);
    if (!existingAlbum) {
      return res.status(404).json({ message: "Album not found" });
    }

    // Update album details if provided
    if (albumName) existingAlbum.albumName = albumName;
    if (albumDescription) existingAlbum.albumDescription = albumDescription;
    if (albumColor) existingAlbum.albumColor = albumColor;

    // Check if a new image is provided and upload it
    if (req.files?.image?.[0]) {
      const imageFile = req.files.image[0];
      const imgUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      existingAlbum.albumImg = imgUpload.secure_url;
    }

    // Handle adding new songs
    if (addSongs.length > 0) {
      existingAlbum.songs = addSongs; // Replace the entire array
    }

    // Save the updated album
    await existingAlbum.save();

    res
      .status(200)
      .json({ message: "Album updated successfully", album: existingAlbum });
  } catch (error) {
    console.error("Error in updating album:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

export const addAlbum = async (req, res) => {
  try {
    const { albumName, albumDescription, albumColor, songIds } = req.body;

    // Check if the image file exists
    if (!req.files || !req.files.image) {
      return res.status(400).json({ message: "Please upload an image file" });
    }

    const imageFile = req.files.image[0];

    // Upload image to Cloudinary
    const imgUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });

    // Parse the songIds if provided
    let songArray = [];
    if (songIds) {
      songArray = songIds.split(',').map((id) => id.trim()); // Split and trim each ID
    }

    // Create a new album document
    const newAlbum = new Album({
      albumName,
      albumImg: imgUpload.secure_url,
      albumDescription,
      albumColor,
      songs: songArray, // Add the songs to the array
    });

    await newAlbum.save();
    res
      .status(201)
      .json({ message: "Album added successfully", album: newAlbum });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

export const getAlbumSongList = async (req, res) => {
  try {
    const { album_id } = req.body;

    if (!album_id) {
      return res.status(400).json({ message: "Please provide album id" });
    }

    const songs = await Song.find({ album: album_id });
    res.status(200).json({ message: "Songs fetched successfully", songs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
};

export const getAlbums = async (req, res) => {
  try {
    // Fetch the album data with selected fields
    const albums = await Album.find();

    res.status(200).json({
      success: true,
      message: "Albums fetched successfully",
      data: albums,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching albums",
      error: error.message,
    });
  }
};

export const getAlbumDetails = async (req, res) => {
  try {
    const { albumId } = req.params;

    // Find the album by ID and populate its songs
    const album = await Album.findById(albumId).populate("songs");

    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    // Return album details
    res.status(200).json(album);
  } catch (error) {
    console.error("Error fetching album details:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


export const getSongDetails = async (req, res) => {
  try {
    const { songId } = req.params;

    // Find the album by ID and populate its songs
    const song = await Song.findById(songId).populate("album");

    if (!song) {
      return res.status(404).json({ message: "song not found" });
    }

    // Return album details
    res.status(200).json(song);
  } catch (error) {
    console.error("Error fetching song details:", error);
    res.status(500).json({ message: "Server Error" });
  }
};



export const deleteSong = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the song to get the album reference
    const song = await Song.findById(id);

    if (!song) {
      return res.status(404).json({ message: "Song not found." });
    }

    // Check if the song is present in any album's songs array and remove it
    await Album.updateMany(
      { songs: id },
      { $pull: { songs: id } }
    );

    // Delete the song
    await Song.findByIdAndDelete(id);

    res.status(200).json({ message: "Song deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Controller to delete an album
export const deleteAlbum = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the album to get the songs array
    const album = await Album.findById(id);

    if (!album) {
      return res.status(404).json({ message: "Album not found." });
    }

  

    // Delete the album
    await Album.findByIdAndDelete(id);

    res.status(200).json({ message: "Album and its songs deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};


export const getCounts = async (req, res) => {
  try {
    const totalSongs = await Song.countDocuments();
    const totalAlbums = await Album.countDocuments();
    const totalUser = await User.countDocuments();
    const totalSingers = await Song.distinct("singerName").then(singers => singers.length);

    res.status(200).json({
      totalSongs,
      totalAlbums,
      totalSingers,
      totalUser
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};
