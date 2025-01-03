import { Router } from "express";
import upload from "../middleware/multer.js";
import { addAlbum, addSong, deleteAlbum, deleteSong, getAlbumDetails, getAlbumSongList, getCounts, getSongDetails, updateAlbum, updateSong } from "../controller/songController.js";
import { createPlaylist, getSongs } from "../controller/playListController.js";
import { authenticateToken } from "../middleware/jwtverify.js";

const router = Router()

router.route('/addSong').post(upload.fields([{ name: 'image', maxCount: 1 }, { name: 'audio', maxCount: 1 }]), addSong);

router.route('/editSong/:id').put(upload.fields([{ name: 'image', maxCount: 1 }, { name: 'audio', maxCount: 1 }]), updateSong);


router.route('/addalbum').post(upload.fields([{name:'image', maxCount:1}]), addAlbum)

router.route('/editAlbum/:id').put(upload.fields([{name:'image', maxCount:1}]), updateAlbum)

router.route('/getalbumSongList').post(getAlbumSongList)

router.post("/songs", getSongs);

router.get('/albumDetails/:albumId', getAlbumDetails)

router.get('/songDetails/:songId', getSongDetails)

router.delete("/deleteSong/:id", deleteSong);

router.delete("/deleteAlbum/:id",  deleteAlbum);

router.get("/dashboard/Count",  getCounts);




export default router;