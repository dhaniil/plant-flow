import express from 'express';
const router = express.Router();

router.get("/device/:device_id", async (req, res) => {
    try {
        const { device_id } = req.params;
        const logsCollection = req.app.locals.getCollection('schedule_logs');
        
        const logs = await logsCollection
            .find({ device_id })
            .sort({ executed_at: -1 })
            .limit(50)
            .toArray();
            
        res.json(logs);
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

export default router; 