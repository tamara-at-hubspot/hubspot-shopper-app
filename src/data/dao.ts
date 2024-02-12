import type { TokenResponseIF } from "@hubspot/api-client/lib/codegen/oauth";
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
): Promise<OauthToken> {
  const { accessToken, refreshToken, expiresIn } = tokensInfo;
  let record = await OauthToken.findByPk(hubId);
  if (record !== null) {
    record.set({
      refreshToken,
      accessToken,
      expiresIn: expiresIn * 0.8,
      refreshedAt: new Date(),
    });
    record.save();
  } else {
    record = await OauthToken.create({
      hubId,
      refreshToken,
      accessToken,
      expiresIn: expiresIn * 0.8,
      refreshedAt: new Date(),
    });
  }
  return record;
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
  upsertOauthToken,
};
