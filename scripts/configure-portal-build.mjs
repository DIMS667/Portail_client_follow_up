import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const portalDirectory = path.resolve("dist", "portail-client");
const portalIndexPath = path.join(portalDirectory, "index.html");
const portalHtaccessPath = path.join(portalDirectory, ".htaccess");

const portalHtaccess = `Options -MultiViews
DirectoryIndex index.html
AddDefaultCharset UTF-8

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /portail-client/
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.html [L]
</IfModule>

<IfModule mod_headers.c>
  Header always set X-Robots-Tag "noindex, nofollow, noarchive"

  <FilesMatch "\\.html?$">
    Header always set Cache-Control "no-cache, no-store, must-revalidate"
    Header always set Cdn-Cache-Control "no-store"
  </FilesMatch>

  <FilesMatch "\\.(?:avif|gif|ico|jpe?g|png|svg|webp)$">
    Header set Cache-Control "public, max-age=604800"
  </FilesMatch>

  <FilesMatch "\\.(?:css|js)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
</IfModule>

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/css text/javascript application/javascript application/json application/xml image/svg+xml
</IfModule>

<FilesMatch "^\\..*deploy-sync-state.*\\.json$">
  Require all denied
</FilesMatch>
`;

let portalHtml = await readFile(portalIndexPath, "utf8");

portalHtml = portalHtml
  .replace(/<title>[\s\S]*?<\/title>/i, "<title>Mon espace assurance | Follow-Up Insurance</title>")
  .replace(/<meta\s+name=["']description["'][^>]*>/i, '<meta name="description" content="Accès sécurisé à votre espace client Follow-Up Insurance." />')
  .replace(/<meta\s+name=["']robots["'][^>]*>\s*/gi, "")
  .replace("</head>", '    <meta name="robots" content="noindex, nofollow, noarchive" />\n  </head>');

await Promise.all([
  writeFile(portalIndexPath, portalHtml, "utf8"),
  writeFile(portalHtaccessPath, portalHtaccess, "utf8"),
]);

console.log("Configured portal build for SPA routing and search-engine exclusion.");
