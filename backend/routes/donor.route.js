import express from 'express';
import { avldatalist, donationform, getid, updateDonor, getDonationsByUserId, requestFood, getUserDonations, getRequestsForDonor, getStatus } from '../controllers/donor.controller.js';

const router = express.Router();

router.post('/donorform', donationform);
router.get('/donorform', avldatalist); 
router.get('/userdonations/:userId', getDonationsByUserId);
router.get('/:id', getid);
router.put('/:id', updateDonor);
router.post('/request', requestFood);
router.get('/userdonations/:userId', getUserDonations); 
router.get('/requests/:userId', getRequestsForDonor);
router.patch('/requests/:requestId/status',getStatus)


export default router;