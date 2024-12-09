import mongoose from "mongoose";

const albumSchema = new mongoose.Schema(
  {
    albumName: {
      type: String,
      required: true,
    },
    albumImg: {
      type: String,
    },
    albumDescription: {
      type: String,
    },
    albumColor:{
      type: String,
      default: '#000' 
    },
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Song" , default: null, }],
  },
  {
    timestamps: true,
  }
);

export const Album = mongoose.model("Album", albumSchema);
