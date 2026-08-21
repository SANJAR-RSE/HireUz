function notFound(req, res, next) {
  res.status(404).json({ message: "Manzil topilmadi" });
}

function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    message: status === 500 ? "Serverda kutilmagan xatolik yuz berdi" : err.message,
  });
}

module.exports = { notFound, errorHandler };
