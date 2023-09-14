const User = require('../models/user.model')
const { genPassword, validatePassword } = require('../lib/utils')

exports.signUp = async (req, res) => {
  try {
    const { username, password } = req.body
    const { salt, hash } = genPassword(password)
    const newUser = await User.create({ username, password, salt, hash })

    req.session.user = newUser
    res.status(201).json({
      status: 'success',
      data: {
        user: newUser,
      },
    })
  } catch (e) {
    res.status(400).json({
      status: 'fail',
    })
  }
}

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body
    const user = await User.findOne({ username })

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'user not found',
      })
    }

    if (validatePassword(password, user.hash, user.salt)) {
      req.session.user = user
      res.status(200).json({
        status: 'success',
      })
    } else {
      res.status(400).json({
        status: 'fail',
        message: 'incorrect username or password',
      })
    }
  } catch (e) {
    res.status(400).json({
      status: 'fail',
    })
  }
}
