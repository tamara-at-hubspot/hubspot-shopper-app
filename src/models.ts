import { Sequelize, DataTypes } from "sequelize";
import type { Model } from "sequelize";
import config from "./config";

const sequelize = new Sequelize(config.sequelize);

interface OauthTokenAttributes {
  hubId: number;
  createdAt: number;
  refreshToken: string;
  accessToken: string;
  refreshedAt: number;
  expiresIn: number;
  disabled: boolean;
}

type OauthTokenInstance = Model<OauthTokenAttributes> & OauthTokenAttributes;

export const OauthToken = sequelize.define<OauthTokenInstance>("OauthToken", {
  hubId: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
  createdAt: { type: DataTypes.INTEGER, allowNull: false },
  refreshToken: { type: DataTypes.STRING(300), allowNull: false },
  accessToken: { type: DataTypes.STRING(300), allowNull: false },
  refreshedAt: { type: DataTypes.INTEGER, allowNull: false },
  expiresIn: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  disabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

// Create the table(s)
(async () => {
  await sequelize.sync({ force: false });
})();

export default sequelize;
