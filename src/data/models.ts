import { Sequelize, DataTypes } from "sequelize";
import {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import config from "../config";

const sequelize = new Sequelize(config.sequelize);

export class OauthToken extends Model<
  InferAttributes<OauthToken>,
  InferCreationAttributes<OauthToken>
> {
  declare hubId: number;
  declare refreshToken: string;
  declare accessToken: string;
  declare refreshedAt: Date;
  declare expiresIn: number; // seconds

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  getExpiresAtMs() {
    return this.refreshedAt.getTime() + this.expiresIn * 1000;
  }

  isAccessTokenValid() {
    return Date.now() < this.getExpiresAtMs();
  }
}

OauthToken.init(
  {
    hubId: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false },
    refreshToken: { type: DataTypes.STRING(300), allowNull: false },
    accessToken: { type: DataTypes.STRING(300), allowNull: false },
    expiresIn: { type: DataTypes.INTEGER, allowNull: false },
    refreshedAt: { type: DataTypes.DATE, allowNull: false },
    createdAt: { type: DataTypes.DATE, allowNull: false },
    updatedAt: { type: DataTypes.DATE, allowNull: false },
  },
  { sequelize, tableName: "oauth" },
);

export class List extends Model<
  InferAttributes<List>,
  InferCreationAttributes<List>
> {
  declare id: CreationOptional<string>;
  declare name: string;
  declare description: string;
  declare hubId: number;
  declare objectTypeId: string;
  declare objectId: number;

  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

List.init(
  {
    id: {
      type: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
    },
    name: { type: DataTypes.STRING(200), allowNull: false },
    description: { type: DataTypes.STRING(1000) },
    hubId: { type: DataTypes.INTEGER, allowNull: false },
    objectTypeId: { type: DataTypes.STRING(50), allowNull: false },
    objectId: { type: DataTypes.INTEGER, allowNull: false },
    createdAt: { type: DataTypes.DATE, allowNull: false },
    updatedAt: { type: DataTypes.DATE, allowNull: false },
  },
  { sequelize, tableName: "lists" },
);

// Create the table(s)
(async () => {
  await sequelize.sync({ force: false });
})();

export default sequelize;
