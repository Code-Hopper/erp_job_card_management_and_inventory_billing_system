const getHealth = (req, res) => {
  res.json({
    status: 'ok',
    service: 'erp-api',
    time: new Date().toISOString(),
  });
};

export { getHealth };
