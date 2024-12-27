import moment from 'moment';
import Interaction from '../models/Interaction.js';
import Lead from '../models/Lead.js';



class AnalyticsService {
    static async getAccountPerformanceMetrics(leadId, timeframe = 30) {
      const endDate = new Date();
      const startDate = moment(endDate).subtract(timeframe, 'days').toDate();
  
      const interactions = await Interaction.find({
        leadId,
        type: 'ORDER',
        createdAt: { $gte: startDate, $lte: endDate }
      }).sort('createdAt');
  
      // Calculate ordering patterns
      const ordersByDay = {};
      const ordersByWeekday = Array(7).fill(0);
      let totalValue = 0;
      let lastOrderDate = null;
      const orderGaps = [];
  
      interactions.forEach(interaction => {
        const date = moment(interaction.createdAt).format('YYYY-MM-DD');
        ordersByDay[date] = (ordersByDay[date] || 0) + 1;
        
        const weekday = moment(interaction.createdAt).day();
        ordersByWeekday[weekday]++;
        
        totalValue += interaction.orderValue;
  
        if (lastOrderDate) {
          const gap = moment(interaction.createdAt).diff(lastOrderDate, 'days');
          orderGaps.push(gap);
        }
        lastOrderDate = interaction.createdAt;
      });
  
      // Calculate trends
      const weeklyTrends = [];
      let currentWeekOrders = 0;
      let currentWeekValue = 0;
      let currentWeekStart = moment(startDate).startOf('week');
  
      interactions.forEach(interaction => {
        const interactionWeek = moment(interaction.createdAt).startOf('week');
        
        if (interactionWeek.isAfter(currentWeekStart)) {
          weeklyTrends.push({
            week: currentWeekStart.format('YYYY-MM-DD'),
            orders: currentWeekOrders,
            value: currentWeekValue
          });
          currentWeekOrders = 0;
          currentWeekValue = 0;
          currentWeekStart = interactionWeek;
        }
        
        currentWeekOrders++;
        currentWeekValue += interaction.orderValue;
      });
  
      // Add final week
      weeklyTrends.push({
        week: currentWeekStart.format('YYYY-MM-DD'),
        orders: currentWeekOrders,
        value: currentWeekValue
      });
  
      return {
        totalOrders: interactions.length,
        totalValue,
        averageOrderValue: totalValue / (interactions.length || 1),
        orderFrequency: interactions.length / timeframe,
        averageGapBetweenOrders: orderGaps.length ? 
          orderGaps.reduce((a, b) => a + b, 0) / orderGaps.length : 0,
        popularOrderDays: ordersByWeekday,
        weeklyTrends,
        orderConsistency: {
          daysWithOrders: Object.keys(ordersByDay).length,
          totalDays: timeframe,
          consistency: (Object.keys(ordersByDay).length / timeframe) * 100
        }
      };
    }
  
    static async getKamAnalytics(kamId, timeframe = 30) {
      const endDate = new Date();
      const startDate = moment(endDate).subtract(timeframe, 'days').toDate();
  
      const leads = await Lead.find({ assignedKam: kamId });
      const leadIds = leads.map(l => l._id);
  
      const interactions = await Interaction.find({
        leadId: { $in: leadIds },
        createdAt: { $gte: startDate, $lte: endDate }
      });
  
      // Calculate KAM performance metrics
      const callsByLead = {};
      const ordersByLead = {};
      const valueByLead = {};
      
      interactions.forEach(interaction => {
        if (interaction.type === 'CALL') {
          callsByLead[interaction.leadId] = (callsByLead[interaction.leadId] || 0) + 1;
        }
        if (interaction.type === 'ORDER') {
          ordersByLead[interaction.leadId] = (ordersByLead[interaction.leadId] || 0) + 1;
          valueByLead[interaction.leadId] = (valueByLead[interaction.leadId] || 0) + interaction.orderValue;
        }
      });
  
      // Calculate conversion metrics
      const leadStatusCounts = leads.reduce((acc, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
      }, {});
  
      return {
        leadMetrics: {
          total: leads.length,
          byStatus: leadStatusCounts,
          conversionRate: (leadStatusCounts.CONVERTED || 0) / leads.length * 100
        },
        interactionMetrics: {
          totalCalls: interactions.filter(i => i.type === 'CALL').length,
          totalOrders: interactions.filter(i => i.type === 'ORDER').length,
          averageCallsPerLead: Object.values(callsByLead).reduce((a, b) => a + b, 0) / leads.length,
          averageOrdersPerLead: Object.values(ordersByLead).reduce((a, b) => a + b, 0) / leads.length
        },
        performanceMetrics: {
          totalValue: Object.values(valueByLead).reduce((a, b) => a + b, 0),
          averageValuePerLead: Object.values(valueByLead).reduce((a, b) => a + b, 0) / leads.length,
          topPerformingLeads: Object.entries(valueByLead)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([leadId, value]) => ({ leadId, value }))
        }
      };
    }
  }

    export default AnalyticsService;