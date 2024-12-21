import { Router } from "express";
import upload from "../middleware/multer.js";
import { addSongToPlaylist, createPlaylist, editPlaylist,  getPlaylistDetails, getPlaylistsByOwnerOrCollaborator, removeSongFromPlaylist } from "../controller/playListController.js";
import { authenticateToken } from "../middleware/jwtverify.js";
import { getAlbums } from "../controller/songController.js";
import multer from "multer";

const formDataReq = multer()

const router = Router()


router.post('/createPlaylist', authenticateToken, upload.fields([{ name: 'image', maxCount: 1 }]), createPlaylist);

router.post('/addSongToPlaylist', authenticateToken,  addSongToPlaylist);

router.post("/playlist/remove-song", authenticateToken, removeSongFromPlaylist);

router.get('/playlists', authenticateToken, getPlaylistsByOwnerOrCollaborator);

router.put('/editplaylists/:playlistId', upload.fields([{ name: 'image', maxCount: 1 }]), editPlaylist);

router.get('/playlist/:playlistId',  getPlaylistDetails);


router.get("/allAlbums",  getAlbums);


export default router;