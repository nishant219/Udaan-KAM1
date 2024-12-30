import Interaction from '../models/Interaction.js';
import Lead from '../models/Lead.js';
import { calculateNextCallDate } from '../utils/timezone.js';

class LeadService {
    static async getPerformanceMetrics(leadId) {
      const interactions = await Interaction.find({ 
        leadId, 
        type: 'ORDER',
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      });
  
      const totalOrders = interactions.length;
      const totalValue = interactions.reduce((sum, i) => sum + i.orderValue, 0);
      const averageOrderValue = totalOrders ? totalValue / totalOrders : 0;
  
      return {
        orderFrequency: totalOrders,
        averageOrderValue,
        totalValue
      };
    }
  
    static async reassignKam(leadId, newKamId) {
      const lead = await Lead.findById(leadId);
      const oldKamId = lead.assignedKam;
      
      lead.assignedKam = newKamId;
      lead.nextCallDate = calculateNextCallDate(lead.callFrequency);
      
      await lead.save();
      await new Interaction({
        leadId,
        type: 'KAM_CHANGE',
        notes: `KAM changed from ${oldKamId} to ${newKamId}`,
        kamId: newKamId
      }).save();
  
      return lead;
    }
  }

    export default LeadService;