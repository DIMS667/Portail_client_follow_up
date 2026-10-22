const configuredBaseUrl = import.meta.env.BASE_URL || "/";

export const appBasePath = configuredBaseUrl === "/"
  ? ""
  : `/${configuredBaseUrl.replace(/^\/+|\/+$/g, "")}`;

export const isPortalDeployment = import.meta.env.MODE === "portal";

export function toBrowserPath(path: string) {
  if (!path.startsWith("/")) return path;
  if (!appBasePath) return path;
  return path === "/" ? `${appBasePath}/` : `${appBasePath}${path}`;
}

export function fromBrowserPath(pathname: string) {
  const normalize = (path: string) => path.length > 1 ? path.replace(/\/+$/, "") : path;
  if (!appBasePath) return normalize(pathname || "/");
  if (pathname === appBasePath || pathname === `${appBasePath}/`) return "/";
  if (pathname.startsWith(`${appBasePath}/`)) return normalize(pathname.slice(appBasePath.length) || "/");
  return normalize(pathname || "/");
}

export function assetUrl(path: string) {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(path)) return path;
  return `${configuredBaseUrl}${path.replace(/^\/+/, "")}`;
}
