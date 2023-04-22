const ifpsProtocol = "ipfs://";

export const ipfsProxy = (url: string) => {
  if (url.startsWith(ifpsProtocol)) {
    return url.replace(ifpsProtocol, "https://ipfs.io/ipfs/");
  }
  return url;
};
