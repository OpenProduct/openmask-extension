export class HttpProvider {
  /**
   * @param host? {string}
   * @param options? {{apiKey: string}}
   */

  host: string;
  options: { apiKey?: string };
  constructor(host: string, options?: { apiKey?: string }) {
    this.host = host || "https://toncenter.com/api/v2/jsonRPC";
    this.options = options || {};
  }

  /**
   * @private
   * @param apiUrl   {string}
   * @param request   {any}
   * @return {Promise<any>}
   */
  sendImpl(apiUrl: string, request: any) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.options.apiKey) {
      headers["X-API-Key"] = this.options.apiKey;
    }

    return fetch(apiUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(request),
    })
      .then((response) => response.json())
      .then(({ result, error }) => result || Promise.reject(error));
  }

  /**
   * @param method    {string}
   * @param params    {any}  todo: Array<any>
   * @return {Promise<any>}
   */
  send(method: string, params: any) {
    return this.sendImpl(this.host, {
      id: 1,
      jsonrpc: "2.0",
      method: method,
      params: params,
    });
  }

  /**
   * Use this method to get information about address: balance, code, data, last_transaction_id.
   * @param address {string}
   */
  async getAddressInfo(address: string) {
    return this.send("getAddressInformation", { address: address });
  }

  /**
   * Similar to previous one but tries to parse additional information for known contract types. This method is based on generic.getAccountState thus number of recognizable contracts may grow. For wallets we recommend to use getWalletInformation.
   * @param address {string}
   */
  async getExtendedAddressInfo(address: string) {
    return this.send("getExtendedAddressInformation", { address: address });
  }

  /**
   * Use this method to retrieve wallet information, this method parse contract state and currently supports more wallet types than getExtendedAddressInformation: simple wallet, stadart wallet and v3 wallet.
   * @param address {string}
   */
  async getWalletInfo(address: string) {
    return this.send("getWalletInformation", { address: address });
  }

  /**
   * Use this method to get transaction history of a given address.
   * @param address   {string}
   * @param limit?    {number}
   * @param lt?    {number}
   * @param hash?    {string}
   * @param to_lt?    {number}
   * @return array of transaction object
   */
  async getTransactions(
    address: string,
    limit = 20,
    lt = undefined,
    hash = undefined,
    to_lt = undefined,
    archival = undefined
  ) {
    return this.send("getTransactions", {
      address,
      limit,
      lt,
      hash,
      to_lt,
      archival,
    });
  }

  /**
   * Use this method to get balance (in nanograms) of a given address.
   * @param address {string}
   */
  async getBalance(address: string) {
    return this.send("getAddressBalance", { address: address });
  }
}
