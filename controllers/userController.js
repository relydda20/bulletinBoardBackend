import User from "../models/User.js";

const userController = {
  getUsers: async (req, res) => {
    const users = await User.find().select("-password");
    res.json(users);
  },
};

export default userController;
