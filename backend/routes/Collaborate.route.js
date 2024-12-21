import { Router } from "express";
import upload from "../middleware/multer.js";
import {  editPlaylist, } from "../controller/playListController.js";
import { authenticateToken } from "../middleware/jwtverify.js";
import { getAlbums } from "../controller/songController.js";
import multer from "multer";
import { getCollaborationRequestsList, respondToCollaborationRequest, sendCollaborationRequest } from "../controller/addCollaborater.js";

const formDataReq = multer()

const router = Router()

router.put('/editplaylists/:playlistId', upload.fields([{ name: 'image', maxCount: 1 }]), editPlaylist);

router.get("/allAlbums",  getAlbums);

router.post('/sendReqToCollaborator', authenticateToken,  sendCollaborationRequest);

router.get('/Collaboration/list', authenticateToken,  getCollaborationRequestsList);

router.post('/Collaboration/response', authenticateToken,  respondToCollaborationRequest);

export default router;