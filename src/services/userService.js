import mongoose from 'mongoose';
import Lead from '../models/Lead.js';
import Interaction from '../models/Interaction.js';
import User from '../models/User.js';
import logger from '../config/winston.js';

// Convert to ES module exports
export const getUserStats = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const leads = await Lead.find({ assignedKam: userId });
    const interactions = await Interaction.find({
      kamId: userId,
      createdAt: {
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    });

    const stats = {
      totalLeads: leads.length,
      activeLeads: leads.filter(l => l.status !== 'CLOSED').length,
      leadsByStatus: leads.reduce((acc, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
      }, {}),
      interactions: {
        total: interactions.length,
        calls: interactions.filter(i => i.type === 'CALL').length,
        orders: interactions.filter(i => i.type === 'ORDER').length,
        meetings: interactions.filter(i => i.type === 'MEETING').length,
      },
      performance: {
        conversionRate: leads.length ? (leads.filter(l => l.status === 'CONVERTED').length / leads.length * 100) : 0,
        averageOrderValue: calculateAverageOrderValue(interactions)
      }
    };

    return stats;
  } catch (error) {
    logger.error('Error getting user stats:', error);
    throw error;
  }
};

export const transferLeadsToNewKam = async (fromUserId, toUserId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Update all leads assigned to fromUser
    const updatedLeads = await Lead.updateMany(
      { assignedKam: fromUserId },
      { 
        $set: { assignedKam: toUserId },
        $push: {
          transferHistory: {
            fromKam: fromUserId,
            toKam: toUserId,
            date: new Date()
          }
        }
      },
      { session }
    );

    // Get updated leads for interaction creation
    const leads = await Lead.find({ assignedKam: toUserId });

    // Create transfer notification interactions
    await Interaction.insertMany(
      leads.map(lead => ({
        leadId: lead._id,
        type: 'KAM_TRANSFER',
        kamId: toUserId,
        notes: `Lead transferred from KAM ${fromUserId}`,
        previousKam: fromUserId
      })),
      { session }
    );

    await session.commitTransaction();
    return leads;
  } catch (error) {
    await session.abortTransaction();
    logger.error('Error transferring leads:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

// Helper function to calculate average order value
const calculateAverageOrderValue = (interactions) => {
  const orders = interactions.filter(i => i.type === 'ORDER');
  if (orders.length === 0) return 0;
  
  const totalValue = orders.reduce((sum, i) => sum + (i.orderValue || 0), 0);
  return totalValue / orders.length;
};