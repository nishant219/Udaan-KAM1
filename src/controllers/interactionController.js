import Interaction from "../models/Interaction.js";
import Lead from "../models/Lead.js";
import logger from "../config/winston.js";
import { calculateNextCallDate } from "../utils/timezone.js";
import LeadService from "../services/leadService.js";
import PerformanceService from "../services/performanceService.js";

export const recordInteraction = async (req, res) => {
    try {
      const { leadId } = req.params;
      const interaction = new Interaction({
        ...req.body,
        leadId,
        kamId: req.user.id
      });
  
      await interaction.save();
  
      if (interaction.type === 'CALL') {
        const lead = await Lead.findById(leadId);
        lead.lastCallDate = new Date();
        lead.nextCallDate = calculateNextCallDate(lead.callFrequency, req.user.timezone);
        await lead.save();
      }
  
      if (interaction.type === 'ORDER') {
        const metrics = await LeadService.getPerformanceMetrics(leadId);
        await Lead.findByIdAndUpdate(leadId, metrics);
      }
  
      res.status(201).json({ status: 'success', data: { interaction } });
    } catch (error) {
      logger.error('Interaction creation error:', error);
      res.status(400).json({ status: 'error', message: error.message });
    }
  };

export const getKamDashboard = async (req, res) => {
    try {
      const startDate = new Date(req.query.startDate || Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      const endDate = new Date(req.query.endDate || Date.now());
  
      const performance = await PerformanceService.getKamPerformance(
        req.user.id,
        startDate,
        endDate
      );
  
      res.json({ status: 'success', data: performance });
    } catch (error) {
      logger.error('Performance dashboard error:', error);
      res.status(500).json({ status: 'error', message: error.message });
    }
};  

export const getLeadInteractions = async (req, res) => {
    try {
      const { leadId } = req.params;
      const interactions = await Interaction.find({ leadId });
  
      res.json({
        status: 'success',
        data: { interactions }
      });
    } catch (error) {
      logger.error('Get interactions error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch interactions'
      });
    }
  };

export const reassignLead = async (req, res) => {
    try {
      const { leadId } = req.params;
      const { newKamId } = req.body;
  
      const lead = await LeadService.reassignKam(leadId, newKamId);
  
      res.json({
        status: 'success',
        data: { lead }
      });
    } catch (error) {
      logger.error('Reassign lead error:', error);
      res.status(400).json({
        status: 'error',
        message: error.message
      });
    }
  };


