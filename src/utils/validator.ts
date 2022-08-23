const INVOICE_ABBR = "nfce";

export const isValidUrl = (url: string): boolean => {
  if (url.indexOf(INVOICE_ABBR) === -1) return false;

  const tokens = url.split("=");
  if (tokens.length !== 2) return false;

  return true;
};
