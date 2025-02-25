const MeetingHistory = require('../../model/schema/meeting');
const mongoose = require('mongoose');

const add = async (req, res) => {

    try {
        const { agenda, attendes, attendesLead, location, related, dateTime, notes } = req.body;
        const createBy = req.user.id;

        const meeting = new MeetingHistory({
            agenda,
            attendes,
            attendesLead,
            location,
            related,
            dateTime,
            notes,
            createBy
        });

        await meeting.save();
        res.status(201).json(meeting);
    } catch (error) {
        res.status(400).json({ error: "Error is "+error.message });
    }
};

const index = async (req, res) => {
    try {
        const Contact = mongoose.models.Contact || mongoose.model('Contact', new mongoose.Schema({}), 'contacts');
        const Lead = mongoose.models.Lead || mongoose.model('Lead', new mongoose.Schema({}), 'leads');
        const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}), 'users');

        const meetings = await MeetingHistory.find({ deleted: false })
            .populate({ path: 'attendes', model: Contact })
            .populate({ path: 'attendesLead', model: Lead })
            .populate({ path: 'createBy', model: User });

        res.json(meetings);
    } catch (error) {
        res.status(500).json({
            error: 'Server error',
            details: `Model resolution failed: ${error.message}`
        });
    }
};


const view = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid ID' });
        }

        const meeting = await MeetingHistory.findOne({ _id: id, deleted: false })
            .populate('attendes attendesLead createBy');

        if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
        res.json(meeting);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteData = async (req, res) => {
    try {
        const { id } = req.params;
        const meeting = await MeetingHistory.findByIdAndUpdate(
            id,
            { deleted: true },
            { new: true }
        );

        if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
        res.json({ message: 'Meeting soft-deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteMany = async (req, res) => {
    try {
        const { ids } = req.body;
        const result = await MeetingHistory.updateMany(
            { _id: { $in: ids }, deleted: false },
            { $set: { deleted: true } }
        );

        if (result.nModified === 0) return res.status(404).json({ error: 'No meetings found' });
        res.json({ message: `${result.nModified} meetings deleted` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { add, index, view, deleteData, deleteMany };


