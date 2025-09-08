const User = require('../models/User'); // Importation en haut, une seule fois
const bcrypt = require('bcryptjs');

// Validation mot de passe complexe
function validatePassword(password) {
  // Minimum 8 caractères, au moins une majuscule, une minuscule, un chiffre et un caractère spécial
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
}


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
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ msg: 'Identifiants invalides' });
  }
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
};

exports.getUsers = async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
};

exports.addUser = async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role)
    return res.status(400).json({ msg: 'Tous les champs sont requis' });

  if (!validatePassword(password)) {
    return res.status(400).json({ msg: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.' });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashed, role });
  await user.save();
  res.status(201).json({ msg: 'Utilisateur ajouté' });
};


exports.editUser = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (updates.password && !validatePassword(updates.password)) {
    return res.status(400).json({ msg: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.' });
  }

  if (updates.password) updates.password = await bcrypt.hash(updates.password, 10);
  const user = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).select('-password');
  if (!user) return res.status(404).json({ msg: 'Utilisateur non trouvé' });
  res.json(user);
};


exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findByIdAndDelete(id);
  if (!user) return res.status(404).json({ msg: 'Utilisateur non trouvé' });
  res.json({ msg: 'Utilisateur supprimé' });
};