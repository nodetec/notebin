export const shortenHash = (hash: string) => {
  if (hash) {
    return hash.substring(0, 4) + "..." + hash.substring(hash.length - 4);
  }
};
