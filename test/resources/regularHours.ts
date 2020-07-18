export default {
  sunday: { isOpen: false },
  monday: {
    hours: [
      { close: '01:00', open: '11:15' }
    ],
    isOpen: true
  },
  tuesday: {
    hours: [
      { close: '23:00', open: '19:00' },
      { close: '18:00', open: '08:00' },
    ],
    isOpen: true
  },
  wednesday: {
    hours: [
      { close: '23:00', open: '08:00' }
    ],
    isOpen: true
  },
  thursday: { isOpen: false },
  friday: {
    hours: [
      { close: '18:00', open: '08:00' }
    ],
    isOpen: true
  },
  saturday: {
    hours: [
      { close: '18:00', open: '08:00' }
    ],
    isOpen: true
  },
};
