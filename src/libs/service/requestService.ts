const ifpsProtocol = "ipfs://";

export const ipfsProxy = (url: string) => {
  if (url.startsWith(ifpsProtocol)) {
    return url.replace(ifpsProtocol, "https://ipfs.fleek.co/ipfs/");
  }
  return url;
};

const requestURL = async <T>(
  jsonDataUrl: string,
  timeout: number
): Promise<T> => {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(jsonDataUrl, { signal: controller.signal });

    clearTimeout(id);

    return await response.json();
  } catch (e) {
    throw new Error(`Failed to load json data from "${jsonDataUrl}"`);
  }
};

const requestIPFS = async <T>(
  jsonDataUrl: string,
  timeout: number
): Promise<T> => {
  try {
    const url = jsonDataUrl.replace(ifpsProtocol, "https://ipfs.io/ipfs/");
    return await requestURL(url, timeout);
  } catch (e) {
    const url = jsonDataUrl.replace(
      ifpsProtocol,
      "https://ipfs.fleek.co/ipfs/"
    );
    return await requestURL(url, timeout);
  }
};

export const requestJson = async <T>(
  jsonDataUrl: string,
  timeout = 15000
): Promise<T> => {
  if (jsonDataUrl.startsWith(ifpsProtocol)) {
    return await requestIPFS(jsonDataUrl, timeout);
  } else {
    return await requestURL(jsonDataUrl, timeout);
  }
};
