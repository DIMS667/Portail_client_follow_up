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
  if (!appBasePath) return pathname || "/";
  if (pathname === appBasePath || pathname === `${appBasePath}/`) return "/";
  if (pathname.startsWith(`${appBasePath}/`)) return pathname.slice(appBasePath.length) || "/";
  return pathname || "/";
}

export function assetUrl(path: string) {
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(path)) return path;
  return `${configuredBaseUrl}${path.replace(/^\/+/, "")}`;
}
