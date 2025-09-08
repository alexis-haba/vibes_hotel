const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


exports.register = async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || typeof password !== 'string') {
    return res.status(400).json({ msg: 'Username et password requis, password doit être une chaîne.' });
  }
  if (await User.findOne({ username })) return res.status(400).json({ msg: 'Utilisateur existe déjà' });
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashed, role });
  await user.save();
  res.status(201).json({ msg: 'Utilisateur enregistré' });
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(401).json({ msg: 'Invalid credentials' });
  }

  // 👇 Ajoute username ici
  const payload = { 
    id: user._id, 
    username: user.username, 
    role: user.role 
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.json({ token });
};


