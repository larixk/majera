module.exports = () => ({
  name: 'Message',
  schema: {
    date: {
      default: Date.now,
      type: Date,
    },
    title: 'INVALID',
  },
});
