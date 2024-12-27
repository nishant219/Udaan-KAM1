import Lead from '../models/Lead.js';
import Interaction from '../models/Interaction.js';

class PerformanceService {
    static async getKamPerformance(kamId, startDate, endDate) {
      const leads = await Lead.find({ assignedKam: kamId });
      const interactions = await Interaction.find({
        leadId: { $in: leads.map(l => l._id) },
        type: 'ORDER',
        createdAt: { $gte: startDate, $lte: endDate }
      });
  
      return {
        totalLeads: leads.length,
        convertedLeads: leads.filter(l => l.status === 'CONVERTED').length,
        totalOrders: interactions.length,
        totalValue: interactions.reduce((sum, i) => sum + i.orderValue, 0)
      };
    }
  }

    export default PerformanceService;