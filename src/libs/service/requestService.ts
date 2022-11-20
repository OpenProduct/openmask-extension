export const ipfsProxy = (url: string) => {
  if (url.startsWith("ipfs://")) {
    return url.replace("ipfs://", "https://ipfs.io/ipfs/");
  }
  return url;
};

export const requestJson = async <T>(
  jsonDataUrl: string,
  timeout = 15000
): Promise<T> => {
  jsonDataUrl = ipfsProxy(jsonDataUrl);
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
