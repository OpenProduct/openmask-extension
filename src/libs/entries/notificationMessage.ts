export interface DeployInputParams {
  workchain?: number;
  initDataCell: string;
  initCodeCell: string;
  initMessageCell?: string;
  amount: string;
}

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
