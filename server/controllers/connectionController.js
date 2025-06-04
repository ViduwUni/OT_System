const mongoose = require('mongoose');

exports.ping = async (req, res) => {
    res.send('pong');
};

exports.mongoStatus = async (req, res) => {
    try {
        const mongoState = mongoose.connection.readyState;

        const mongoStatus =
            mongoState === 1
                ? 'connected'
                : mongoState === 2
                    ? 'connecting'
                    : mongoState === 3
                        ? 'disconnecting'
                        : 'disconnected';

        res.status(200).json({
            db: mongoStatus,
        });
    } catch (error) {
        res.status(500).json({
            db: 'unknown',
            error: error.message,
        });
    }
};