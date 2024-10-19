const User = require('../models/signup');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


exports.postAddUser = async (req, res, next) => {
    try {
      const username = req.body.username;
      const useremail = req.body.useremail;
      const userpassword = req.body.userpassword;

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userpassword, saltRounds)
      const existingUser = await User.findOne({ where: { useremail: useremail } });
      if (existingUser) {
        console.log('user exists!')
        return res.status(400).json({ error: 'User already exists' });
        
      }
      const data = await User.create({
        username: username,
        useremail: useremail,
        userpassword: hashedPassword,
      });
      console.log('Sign Up data: ', data)

      res.status(201).json({ newUserDetails: data });
      console.log('Added to server');
    } catch (err) {
      console.error('Error in postAddProduct:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };