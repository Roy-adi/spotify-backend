import mongoose from "mongoose";

const songSchema = new mongoose.Schema({
    songName: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    image: {
        type: String, // URL to the image
    },
    audio: {
        type: String, // URL to the audio file
        required: true,
    },
    album: {
        type: mongoose.Schema.Types.ObjectId,
        index: true,
        ref: 'Album',
    },
    duration: {
        type: Number, // Duration in seconds or as preferred
        
    },
    singerName: {
      type: String,

    },
}, {
    timestamps: true,
});

export const Song = mongoose.model('Song', songSchema);

