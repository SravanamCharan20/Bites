import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';


export const signup = async (req, res, next) => {
  const { username, email, password, location } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ success: false, message: 'username, email, and password are required' });
  }
  const hashedPassword = bcryptjs.hashSync(password, 10);
  const newUser = new User({ username, email, password: hashedPassword, location });
  try {
    await newUser.save();
    res.status(201).json({ success: true, message: 'User created successfully' });
  } catch (error) {
    next(error);
  }
};
export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const validUser = await User.findOne({ email });
    if (!validUser) return next(errorHandler(404, 'User not found'));

    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) return next(errorHandler(401, 'Wrong credentials'));

    const location = validUser.location;
    const tokenPayload = {
      id: validUser._id,
      ...(location?.state && location?.city
        ? { state: location.state, city: location.city }
        : { latitude: location?.latitude, longitude: location?.longitude }),
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '7d' });

    const { password: hashedPassword, ...rest } = validUser._doc;
    res.status(200).json({ token, user: rest });
  } catch (error) {
    next(error);
  }
};