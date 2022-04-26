const isValidEmail = (str) => {
  const email_regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  return email_regex.test(str)
}

exports.validateUserData = (req, res, next) => {
  const mandatory_fields = ['name', 'email', 'password']

  for (const field of mandatory_fields) {
    if (!req.body[field]) {
      return res.status(400).json({ message: `Missing field: ${field}` })
    }
  }

  if (!isValidEmail(req.body.email)) {
    return res.status(400).json({ message: 'Invalid email.' })
  }

  next()
}
