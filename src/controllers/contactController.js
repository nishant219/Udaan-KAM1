import Contact from '../models/Contact.js';
import logger from '../config/winston.js';

exports.addContact = async (req, res) => {
    try {
      const { leadId } = req.params;
      const contact = new Contact({ ...req.body, leadId });
      await contact.save();
  
      if (contact.isPrimary) {
        await Contact.updateMany(
          { leadId, _id: { $ne: contact._id } },
          { isPrimary: false }
        );
      }
  
      res.status(201).json({ status: 'success', data: { contact } });
    } catch (error) {
      logger.error('Contact creation error:', error);
      res.status(400).json({ status: 'error', message: error.message });
    }
  };

exports.getContacts = async (req, res) => {
    try {
        const contacts = await Contact.find({ createdBy: req.user.id });

        res.json({
            status: 'success',
            data: { contacts }
        });
    } catch (error) {
        logger.error('Get contacts error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch contacts'
        });
    }
};

