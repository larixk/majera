module.exports = () => ({
  name: 'Message',
  schema: {
    properties: {
      title: {
        required: true,
        type: String,
      },
    },
    required: ['title'],
    type: 'object',
  },
});
