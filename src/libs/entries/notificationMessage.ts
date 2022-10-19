import Joi from "joi";

export interface DeployInputParams {
  workchain?: number;
  initDataCell: string;
  initCodeCell: string;
  initMessageCell?: string;
  amount: string;
}

export const DeployInputParamsSchema = Joi.object<DeployInputParams>({
  workchain: Joi.number().optional(),
  initDataCell: Joi.string().required(),
  initCodeCell: Joi.string().required(),
  initMessageCell: Joi.string().optional(),
  amount: Joi.string(),
});

export interface DeployOutputParams {
  walletSeqNo: number;
  newContractAddress: string;
}

export interface RawSignInputParams {
  data: string; // Cell boc hex
}

export interface SwitchNetworkParams {
  network: string;
}

export interface ConnectDAppParams {}
