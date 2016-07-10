module.exports = () => ({
  name: 'Message',
  schema: {
    properties: {
      title: {
        type: 'string',
      },
    },
    required: ['title'],
    type: 'object',
  },
});
