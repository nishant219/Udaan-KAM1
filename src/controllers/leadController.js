import Lead from '../models/Lead.js';
import Interaction from '../models/Interaction.js';
import logger from '../config/winston.js';

const FREQUENCY_TO_DAYS = {
  'DAILY': 1,
  'WEEKLY': 7,
  'BIWEEKLY': 14,
  'MONTHLY': 30
};


export const createLead = async (req, res) => {
    try {
      console.log(req.body.callFrequency);
      console.log(req.user.timezone);
      const nextCallDate = calculateNextCallDate(req.body.callFrequency, req.user.timezone);
    
      const lead = new Lead({
        ...req.body,
        assignedKam: req.user.id,
        nextCallDate,
        lastCallDate: new Date() // Initialize lastCallDate to current date
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
  
      const interaction = new Interaction({
        lead: leadId,
        status,
        notes
      });

      await interaction.save();
  
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

export  const calculateNextCallDate = (callFrequency, timezone) => {
    const days = FREQUENCY_TO_DAYS[callFrequency];
    const nextCallDate = new Date();
    nextCallDate.setDate(nextCallDate.getDate() + days);
  
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


