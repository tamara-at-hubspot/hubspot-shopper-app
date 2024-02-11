import type { TokenResponseIF } from "@hubspot/api-client/lib/codegen/oauth";
import type { OauthTokenInstance } from "./models";
import { OauthToken } from "./models";

async function getOauthTokenOrThrow(hubId: number) {
  const record = await OauthToken.findByPk(hubId);
  if (record === null) {
    throw new Error(`No oauth token for hub ${hubId}`);
  }
  return record;
}

async function upsertOauthToken(
  hubId: number,
  tokensInfo: TokenResponseIF,
): Promise<OauthTokenInstance> {
  const { accessToken, refreshToken, expiresIn } = tokensInfo;
  let record = await OauthToken.findByPk(hubId);
  if (record !== null) {
    record.set({
      refreshToken,
      accessToken,
      refreshedAt: Date.now(),
      expiresIn: expiresIn * 1000 * 0.8, // milliseconds
      disabled: false,
    });
    record.save();
  } else {
    record = await OauthToken.create({
      hubId,
      createdAt: Date.now(),
      refreshToken,
      accessToken,
      refreshedAt: Date.now(),
      expiresIn: expiresIn * 1000 * 0.8, // milliseconds
      disabled: false,
    });
  }
  return record;
}

function isAccessTokenValid(record: OauthTokenInstance): boolean {
  return Date.now() < record.refreshedAt + record.expiresIn;
}

async function getFirstHubId(): Promise<number | undefined> {
  const record = await OauthToken.findOne();
  return record?.hubId;
}

async function getAllHubIds(): Promise<number[]> {
  const records = await OauthToken.findAll();
  return records.map((record) => record.hubId);
}

export default {
  getFirstHubId,
  getAllHubIds,
  getOauthTokenOrThrow,
  isAccessTokenValid,
  upsertOauthToken,
};
