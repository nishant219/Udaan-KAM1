import moment from 'moment-timezone';

class TimezoneService {
    static calculateNextCallDate(frequency, timezone = 'UTC', currentDate = new Date()) {
      const localMoment = moment.tz(currentDate, timezone);
      
      switch (frequency) {
        case 'DAILY':
          return localMoment.add(1, 'day').startOf('day').toDate();
        case 'WEEKLY':
          return localMoment.add(1, 'week').startOf('day').toDate();
        case 'BIWEEKLY':
          return localMoment.add(2, 'weeks').startOf('day').toDate();
        case 'MONTHLY':
          return localMoment.add(1, 'month').startOf('day').toDate();
        default:
          return localMoment.add(1, 'week').startOf('day').toDate();
      }
    }
  
    static isWorkingHours(timezone = 'UTC') {
      const localTime = moment.tz(timezone);
      const hour = localTime.hour();
      const dayOfWeek = localTime.day();
      
      // Consider working hours 9 AM to 6 PM, Monday to Friday
      return dayOfWeek >= 1 && dayOfWeek <= 5 && hour >= 9 && hour < 18;
    }
  
    static getNextWorkingDay(timezone = 'UTC') {
      let nextDay = moment.tz(timezone);
      while (nextDay.day() === 0 || nextDay.day() === 6) {
        nextDay.add(1, 'day');
      }
      return nextDay.startOf('day');
    }
  
    static formatLocalTime(date, timezone = 'UTC', format = 'YYYY-MM-DD HH:mm:ss z') {
      return moment(date).tz(timezone).format(format);
    }
  }

    export default TimezoneService;