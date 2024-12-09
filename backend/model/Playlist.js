import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({
  playlistName: {
    type: String,
  },
  playlistImg: {
    type: String, // URL to the playlist image
  },
  songs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song',
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming you have a User model
    required: true,
  },
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
}, {
  timestamps: true,
});

export const Playlist = mongoose.model('Playlist', playlistSchema);
