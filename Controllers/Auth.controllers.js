const createError = require("http-errors");
const User = require("../Modals/User.modal");
const { authSchema } = require("../helpers/validation_schema");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../helpers/jwt_helper");

module.exports = {
  register: async (req, res, next) => {
    try {
      const result = await authSchema.validateAsync(req.body);
      const doesExist = await User.findOne({ email: result.email });
      if (doesExist)
        throw createError.Conflict(`${result.email} is already rejistered`);
      const user = new User(result);
      const saveUser = await user.save();
      const AccessToken = await signAccessToken(saveUser?.id);
      res.send({ AccessToken });
    } catch (error) {
      if (error.isJoi) error.status = 422;
      next(error);
    }
  },
  login: async (req, res, next) => {
    try {
      const result = await authSchema.validateAsync(req.body);
      const user = await User.findOne({ email: result.email });

      if (!user) throw createError.NotFound("User not registered");

      const isMatch = await user.isValidPassword(result.password);
      if (!isMatch)
        throw createError.Unauthorized("Username/password are not valid");
      const AccessToken = await signAccessToken(user.id);
      const RefreshToken = await signRefreshToken(user.id);

      res.send({ AccessToken, RefreshToken });
    } catch (error) {
      if (error.isJoi)
        return next(createError.BadRequest("Invalid username/password"));
      next(error);
    }
  },
  refreshToken: async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) throw createError.BadRequest();
      const userId = await verifyRefreshToken(refreshToken);

      const accessToken = await signAccessToken(userId);
      const refToken = await signRefreshToken(userId);
      res.send({ AccessToken: accessToken, RefreshToken: refToken });
    } catch (error) {
      next(error);
    }
  },
  logout: async (req, res, next) => {
    res.send("logout token route");
  },
};
