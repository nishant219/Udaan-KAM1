import Lead from '../models/Lead.js';
import Interaction from '../models/Interaction.js';
import logger from '../config/winston.js';

export const createLead = async (req, res) => {
    try {
      const lead = new Lead({
        ...req.body,
        assignedKam: req.user.id,
        nextCallDate: calculateNextCallDate(req.body.callFrequency, req.user.timezone)
      });
  
      await lead.save();
      logger.info(`New lead created: ${lead._id}`);
  
      res.status(201).json({
        status: 'success',
        data: { lead }
      });
    } catch (error) {
      logger.error('Lead creation error:', error);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  };
  
export const getTodayCalls = async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
  
      const leads = await Lead.find({
        assignedKam: req.user.id,
        nextCallDate: {
          $gte: today,
          $lt: tomorrow
        }
      }).populate('contacts');
  
      res.json({
        status: 'success',
        data: { leads }
      });
    } catch (error) {
      logger.error('Get today calls error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch today\'s calls'
      });
    }
  };
  
export const updateLeadStatus = async (req, res) => {
    try {
      const { leadId } = req.params;
      const { status, notes } = req.body;
  
      const lead = await Lead.findOneAndUpdate(
        { _id: leadId, assignedKam: req.user.id },
        { status },
        { new: true }
      );
  
      if (!lead) {
        return res.status(404).json({
          status: 'error',
          message: 'Lead not found'
        });
      }
  
      // Record status change interaction
      await new Interaction({
        leadId,
        type: 'STATUS_CHANGE',
        notes,
        kamId: req.user.id
      }).save();
  
      res.json({
        status: 'success',
        data: { lead }
      });
    } catch (error) {
      logger.error('Lead status update error:', error);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  };

export const calculateNextCallDate = (callFrequency, timezone) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    const nextCallDate = new Date(today);
    nextCallDate.setDate(nextCallDate.getDate() + callFrequency);
  
    // Adjust for timezone
    const offset = today.getTimezoneOffset() - timezone * 60;
    nextCallDate.setMinutes(nextCallDate.getMinutes() + offset);
  
    return nextCallDate;
  };
    
export const getLeads = async (req, res) => {
    try {
      const leads = await Lead.find({ assignedKam: req.user.id });
  
      res.json({
        status: 'success',
        data: { leads }
      });
    } catch (error) {
      logger.error('Get leads error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch leads'
      });
    }
  };

export const getLead = async (req, res) => {
    try {
      const { leadId } = req.params;
  
      const lead = await Lead.findOne({ _id: leadId, assignedKam: req.user.id });
  
      if (!lead) {
        return res.status(404).json({
          status: 'error',
          message: 'Lead not found'
        });
      }
  
      res.json({
        status: 'success',
        data: { lead }
      });
    } catch (error) {
      logger.error('Get lead error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch lead'
      });
    }
};

export const deleteLead = async (req, res) => {
  try {
    const { leadId } = req.params;

    const result = await Lead.findOneAndDelete({ _id: leadId, assignedKam: req.user.id });

    if (!result) {
      return res.status(404).json({
        status: 'error',
        message: 'Lead not found',
      });
    }

    res.json({
      status: 'success',
      message: 'Lead deleted successfully',
    });
  } catch (error) {
    logger.error('Delete lead error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete lead',
    });
  }
};


