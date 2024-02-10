export function removeTrailingSlash(url: string): string {
  return url.trim().replace("/+$", "");
}

export function addLeadingSlash(path: string): string {
  if (path.startsWith("/")) {
    return path.trim().replace("^/+", "/");
  }
  return "/" + path.trim();
}

export function normalizePath(path: string): string {
  return addLeadingSlash(removeTrailingSlash(path));
}
