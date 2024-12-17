import { Router } from "express";
import upload from "../middleware/multer.js";
import { addSongToPlaylist, createPlaylist, editPlaylist, getOwnerPlaylistDetails, getPlaylistsByOwner, removeSongFromPlaylist } from "../controller/playListController.js";
import { authenticateToken } from "../middleware/jwtverify.js";
import { getAlbums } from "../controller/songController.js";

const router = Router()


router.post('/createPlaylist', authenticateToken, upload.fields([{ name: 'image', maxCount: 1 }]), createPlaylist);

router.post('/addSongToPlaylist', authenticateToken,  addSongToPlaylist);

router.post("/playlist/remove-song", authenticateToken, removeSongFromPlaylist);

router.get('/playlists', authenticateToken, getPlaylistsByOwner);

router.put('/editplaylists/:playlistId',  editPlaylist);

router.get('/playlist/:playlistId', authenticateToken, getOwnerPlaylistDetails);


router.get("/allAlbums",  getAlbums);


export default router;