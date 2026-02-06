globalThis.process ??= {}; globalThis.process.env ??= {};
import { v as NOOP_MIDDLEWARE_HEADER, w as decodeKey } from './chunks/astro/server_D1KRmeP4.mjs';
import './chunks/shared_or7P4sHJ.mjs';

const NOOP_MIDDLEWARE_FN = async (_ctx, next) => {
  const response = await next();
  response.headers.set(NOOP_MIDDLEWARE_HEADER, "true");
  return response;
};

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///C:/Users/PatrickBongalos/Documents/Patrick%20Document/Astro-ElysiaJS/AstroElysia/","cacheDir":"file:///C:/Users/PatrickBongalos/Documents/Patrick%20Document/Astro-ElysiaJS/AstroElysia/node_modules/.astro/","outDir":"file:///C:/Users/PatrickBongalos/Documents/Patrick%20Document/Astro-ElysiaJS/AstroElysia/dist/","srcDir":"file:///C:/Users/PatrickBongalos/Documents/Patrick%20Document/Astro-ElysiaJS/AstroElysia/src/","publicDir":"file:///C:/Users/PatrickBongalos/Documents/Patrick%20Document/Astro-ElysiaJS/AstroElysia/public/","buildClientDir":"file:///C:/Users/PatrickBongalos/Documents/Patrick%20Document/Astro-ElysiaJS/AstroElysia/dist/","buildServerDir":"file:///C:/Users/PatrickBongalos/Documents/Patrick%20Document/Astro-ElysiaJS/AstroElysia/dist/_worker.js/","adapterName":"@astrojs/cloudflare","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image\\/?$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/@astrojs/cloudflare/dist/entrypoints/image-endpoint.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/[...slug]","isIndex":false,"type":"endpoint","pattern":"^\\/api(?:\\/(.*?))?\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"...slug","dynamic":true,"spread":true}]],"params":["...slug"],"component":"src/pages/api/[...slug].ts","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"inline","content":"#background[data-astro-cid-mmc7otgs]{position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1;filter:blur(100px)}#container[data-astro-cid-mmc7otgs]{font-family:Inter,Roboto,Helvetica Neue,Arial Nova,Nimbus Sans,Arial,sans-serif;height:100%}main[data-astro-cid-mmc7otgs]{height:100%;display:flex;justify-content:center}#hero[data-astro-cid-mmc7otgs]{display:flex;align-items:start;flex-direction:column;justify-content:center;padding:16px}h1[data-astro-cid-mmc7otgs]{font-size:22px;margin-top:.25em}#links[data-astro-cid-mmc7otgs]{display:flex;gap:16px}#links[data-astro-cid-mmc7otgs] a[data-astro-cid-mmc7otgs]{display:flex;align-items:center;padding:10px 12px;color:#111827;text-decoration:none;transition:color .2s}#links[data-astro-cid-mmc7otgs] a[data-astro-cid-mmc7otgs]:hover{color:#4e5056}#links[data-astro-cid-mmc7otgs] a[data-astro-cid-mmc7otgs] svg[data-astro-cid-mmc7otgs]{height:1em;margin-left:8px}#links[data-astro-cid-mmc7otgs] a[data-astro-cid-mmc7otgs].button{color:#fff;background:linear-gradient(83.21deg,#3245ff,#bc52ee);box-shadow:inset 0 0 0 1px #ffffff1f,inset 0 -2px #0000003d;border-radius:10px}#links[data-astro-cid-mmc7otgs] a[data-astro-cid-mmc7otgs].button:hover{color:#e6e6e6;box-shadow:none}pre[data-astro-cid-mmc7otgs]{font-family:ui-monospace,Cascadia Code,Source Code Pro,Menlo,Consolas,DejaVu Sans Mono,monospace;font-weight:400;background:linear-gradient(14deg,#d83333,#f041ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin:0}h2[data-astro-cid-mmc7otgs]{margin:0 0 1em;font-weight:400;color:#111827;font-size:20px}p[data-astro-cid-mmc7otgs]{color:#4b5563;font-size:16px;line-height:24px;letter-spacing:-.006em;margin:0}code[data-astro-cid-mmc7otgs]{display:inline-block;background:linear-gradient(66.77deg,#f3cddd,#f5cee7) padding-box,linear-gradient(155deg,#d83333,#f041ff 18%,#f5cee7 45%) border-box;border-radius:8px;border:1px solid transparent;padding:6px 8px}.box[data-astro-cid-mmc7otgs]{padding:16px;background:#fff;border-radius:16px;border:1px solid white}#news[data-astro-cid-mmc7otgs]{position:absolute;bottom:16px;right:16px;max-width:300px;text-decoration:none;transition:background .2s;backdrop-filter:blur(50px)}#news[data-astro-cid-mmc7otgs]:hover{background:#ffffff8c}@media screen and (max-height:368px){#news[data-astro-cid-mmc7otgs]{display:none}}@media screen and (max-width:768px){#container[data-astro-cid-mmc7otgs]{display:flex;flex-direction:column}#hero[data-astro-cid-mmc7otgs]{display:block;padding-top:10%}#links[data-astro-cid-mmc7otgs]{flex-wrap:wrap}#links[data-astro-cid-mmc7otgs] a[data-astro-cid-mmc7otgs].button{padding:14px 18px}#news[data-astro-cid-mmc7otgs]{right:16px;left:16px;bottom:2.5rem;max-width:100%}h1[data-astro-cid-mmc7otgs]{line-height:1.5}}html,body{margin:0;width:100%;height:100%}\n"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["C:/Users/PatrickBongalos/Documents/Patrick Document/Astro-ElysiaJS/AstroElysia/src/pages/index.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000astro-internal:middleware":"_astro-internal_middleware.mjs","\u0000virtual:astro:actions/noop-entrypoint":"noop-entrypoint.mjs","\u0000@astro-page:src/pages/api/[...slug]@_@ts":"pages/api/_---slug_.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"index.js","\u0000@astro-renderers":"renderers.mjs","\u0000@astro-page:node_modules/@astrojs/cloudflare/dist/entrypoints/image-endpoint@_@js":"pages/_image.astro.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_BAl101W5.mjs","C:/Users/PatrickBongalos/Documents/Patrick Document/Astro-ElysiaJS/AstroElysia/node_modules/unstorage/drivers/cloudflare-kv-binding.mjs":"chunks/cloudflare-kv-binding_DMly_2Gl.mjs","C:/Users/PatrickBongalos/Documents/Patrick Document/Astro-ElysiaJS/AstroElysia/node_modules/astro/dist/assets/services/sharp.js":"chunks/sharp_BwC1jYKg.mjs","C:/Users/PatrickBongalos/Documents/Patrick Document/Astro-ElysiaJS/AstroElysia/node_modules/file-type/core.js":"chunks/core_Qzr7tGb-.mjs","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["/_astro/background.Mahwsfbs.svg","/_astro/astro.CXuftnGC.svg","/favicon.ico","/favicon.svg","/_worker.js/index.js","/_worker.js/noop-entrypoint.mjs","/_worker.js/renderers.mjs","/_worker.js/_@astrojs-ssr-adapter.mjs","/_worker.js/_astro-internal_middleware.mjs","/_worker.js/pages/index.astro.mjs","/_worker.js/pages/_image.astro.mjs","/_worker.js/chunks/astro_DvB6irS6.mjs","/_worker.js/chunks/cloudflare-kv-binding_DMly_2Gl.mjs","/_worker.js/chunks/core_Qzr7tGb-.mjs","/_worker.js/chunks/image-endpoint_D9Jasc16.mjs","/_worker.js/chunks/path_BkbHhm0C.mjs","/_worker.js/chunks/shared_or7P4sHJ.mjs","/_worker.js/chunks/sharp_BwC1jYKg.mjs","/_worker.js/chunks/_@astrojs-ssr-adapter_CJmmHj7x.mjs","/_worker.js/_astro/astro.CXuftnGC.svg","/_worker.js/_astro/background.Mahwsfbs.svg","/_worker.js/pages/api/_---slug_.astro.mjs","/_worker.js/chunks/astro/server_D1KRmeP4.mjs"],"buildFormat":"directory","checkOrigin":true,"allowedDomains":[],"serverIslandNameMap":[],"key":"R1paj4jat2yBH1YICRio7GB0qNTwN+f7GRlfIaiyr2o=","sessionConfig":{"driver":"cloudflare-kv-binding","options":{"binding":"SESSION"}}});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = () => import('./chunks/cloudflare-kv-binding_DMly_2Gl.mjs');

export { manifest };
