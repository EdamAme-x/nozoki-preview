/* eslint-disable @typescript-eslint/ban-ts-comment */ import { METHOD_NAME_ALL, METHODS, UnsupportedPathError } from '../../router.ts';
import { checkOptionalParameter } from '../../utils/url.ts';
import { PATH_ERROR } from './node.ts';
import { Trie } from './trie.ts';
const methodNames = [
    METHOD_NAME_ALL,
    ...METHODS
].map((method)=>method.toUpperCase());
const emptyParam = {};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nullMatcher = [
    /^$/,
    [],
    {}
];
let wildcardRegExpCache = {};
function buildWildcardRegExp(path) {
    return wildcardRegExpCache[path] ??= new RegExp(path === '*' ? '' : `^${path.replace(/\/\*/, '(?:|/.*)')}$`);
}
function clearWildcardRegExpCache() {
    wildcardRegExpCache = {};
}
function buildMatcherFromPreprocessedRoutes(routes) {
    const trie = new Trie();
    const handlerData = [];
    if (routes.length === 0) {
        return nullMatcher;
    }
    const routesWithStaticPathFlag = routes.map((route)=>[
            !/\*|\/:/.test(route[0]),
            ...route
        ]).sort(([isStaticA, pathA], [isStaticB, pathB])=>isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length);
    const staticMap = {};
    for(let i = 0, j = -1, len = routesWithStaticPathFlag.length; i < len; i++){
        const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
        if (pathErrorCheckOnly) {
            staticMap[path] = {
                handlers,
                params: emptyParam
            };
        } else {
            j++;
        }
        let paramMap;
        try {
            paramMap = trie.insert(path, j, pathErrorCheckOnly);
        } catch (e) {
            throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
        }
        if (pathErrorCheckOnly) {
            continue;
        }
        handlerData[j] = paramMap.length === 0 ? [
            {
                handlers,
                params: emptyParam
            },
            null
        ] : [
            handlers,
            paramMap
        ];
    }
    const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
    for(let i = 0, len = handlerData.length; i < len; i++){
        const paramMap = handlerData[i][1];
        if (paramMap) {
            for(let j = 0, len = paramMap.length; j < len; j++){
                paramMap[j][1] = paramReplacementMap[paramMap[j][1]];
            }
        }
    }
    const handlerMap = [];
    // using `in` because indexReplacementMap is a sparse array
    for(const i in indexReplacementMap){
        handlerMap[i] = handlerData[indexReplacementMap[i]];
    }
    return [
        regexp,
        handlerMap,
        staticMap
    ];
}
function findMiddleware(middleware, path) {
    if (!middleware) {
        return undefined;
    }
    for (const k of Object.keys(middleware).sort((a, b)=>b.length - a.length)){
        if (buildWildcardRegExp(k).test(path)) {
            return [
                ...middleware[k]
            ];
        }
    }
    return undefined;
}
export class RegExpRouter {
    name = 'RegExpRouter';
    middleware;
    routes;
    constructor(){
        this.middleware = {
            [METHOD_NAME_ALL]: {}
        };
        this.routes = {
            [METHOD_NAME_ALL]: {}
        };
    }
    add(method, path, handler) {
        const { middleware , routes  } = this;
        if (!middleware || !routes) {
            throw new Error('Can not add a route since the matcher is already built.');
        }
        if (methodNames.indexOf(method) === -1) methodNames.push(method);
        if (!middleware[method]) {
            [
                middleware,
                routes
            ].forEach((handlerMap)=>{
                handlerMap[method] = {};
                Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p)=>{
                    handlerMap[method][p] = [
                        ...handlerMap[METHOD_NAME_ALL][p]
                    ];
                });
            });
        }
        if (path === '/*') {
            path = '*';
        }
        if (/\*$/.test(path)) {
            const re = buildWildcardRegExp(path);
            if (method === METHOD_NAME_ALL) {
                Object.keys(middleware).forEach((m)=>{
                    middleware[m][path] ||= findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
                });
            } else {
                middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
            }
            Object.keys(middleware).forEach((m)=>{
                if (method === METHOD_NAME_ALL || method === m) {
                    Object.keys(middleware[m]).forEach((p)=>{
                        re.test(p) && middleware[m][p].push(handler);
                    });
                }
            });
            Object.keys(routes).forEach((m)=>{
                if (method === METHOD_NAME_ALL || method === m) {
                    Object.keys(routes[m]).forEach((p)=>re.test(p) && routes[m][p].push(handler));
                }
            });
            return;
        }
        const paths = checkOptionalParameter(path) || [
            path
        ];
        for(let i = 0, len = paths.length; i < len; i++){
            const path = paths[i];
            Object.keys(routes).forEach((m)=>{
                if (method === METHOD_NAME_ALL || method === m) {
                    routes[m][path] ||= [
                        ...findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || []
                    ];
                    routes[m][path].push(handler);
                }
            });
        }
    }
    match(method, path) {
        clearWildcardRegExpCache() // no longer used.
        ;
        const matchers = this.buildAllMatchers();
        this.match = (method, path)=>{
            const matcher = matchers[method];
            const staticMatch = matcher[2][path];
            if (staticMatch) {
                return staticMatch;
            }
            const match = path.match(matcher[0]);
            if (!match) {
                return null;
            }
            const index = match.indexOf('', 1);
            const [handlers, paramMap] = matcher[1][index];
            if (!paramMap) {
                return handlers;
            }
            const params = {};
            for(let i = 0, len = paramMap.length; i < len; i++){
                params[paramMap[i][0]] = match[paramMap[i][1]];
            }
            return {
                handlers,
                params
            };
        };
        return this.match(method, path);
    }
    buildAllMatchers() {
        const matchers = {};
        methodNames.forEach((method)=>{
            matchers[method] = this.buildMatcher(method) || matchers[METHOD_NAME_ALL];
        });
        // Release cache
        this.middleware = this.routes = undefined;
        return matchers;
    }
    buildMatcher(method) {
        const routes = [];
        let hasOwnRoute = method === METHOD_NAME_ALL;
        [
            this.middleware,
            this.routes
        ].forEach((r)=>{
            const ownRoute = r[method] ? Object.keys(r[method]).map((path)=>[
                    path,
                    r[method][path]
                ]) : [];
            if (ownRoute.length !== 0) {
                hasOwnRoute ||= true;
                routes.push(...ownRoute);
            } else if (method !== METHOD_NAME_ALL) {
                routes.push(...Object.keys(r[METHOD_NAME_ALL]).map((path)=>[
                        path,
                        r[METHOD_NAME_ALL][path]
                    ]));
            }
        });
        if (!hasOwnRoute) {
            return null;
        } else {
            return buildMatcherFromPreprocessedRoutes(routes);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My40LjEvcm91dGVyL3JlZy1leHAtcm91dGVyL3JvdXRlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnQgKi9cbmltcG9ydCB0eXBlIHsgUm91dGVyLCBSZXN1bHQgfSBmcm9tICcuLi8uLi9yb3V0ZXIudHMnXG5pbXBvcnQgeyBNRVRIT0RfTkFNRV9BTEwsIE1FVEhPRFMsIFVuc3VwcG9ydGVkUGF0aEVycm9yIH0gZnJvbSAnLi4vLi4vcm91dGVyLnRzJ1xuaW1wb3J0IHsgY2hlY2tPcHRpb25hbFBhcmFtZXRlciB9IGZyb20gJy4uLy4uL3V0aWxzL3VybC50cydcbmltcG9ydCB7IFBBVEhfRVJST1IgfSBmcm9tICcuL25vZGUudHMnXG5pbXBvcnQgdHlwZSB7IFBhcmFtTWFwIH0gZnJvbSAnLi90cmllLnRzJ1xuaW1wb3J0IHsgVHJpZSB9IGZyb20gJy4vdHJpZS50cydcblxuY29uc3QgbWV0aG9kTmFtZXMgPSBbTUVUSE9EX05BTUVfQUxMLCAuLi5NRVRIT0RTXS5tYXAoKG1ldGhvZCkgPT4gbWV0aG9kLnRvVXBwZXJDYXNlKCkpXG5cbnR5cGUgSGFuZGxlckRhdGE8VD4gPSBbVFtdLCBQYXJhbU1hcF0gfCBbUmVzdWx0PFQ+LCBudWxsXVxudHlwZSBTdGF0aWNNYXA8VD4gPSBSZWNvcmQ8c3RyaW5nLCBSZXN1bHQ8VD4+XG50eXBlIE1hdGNoZXI8VD4gPSBbUmVnRXhwLCBIYW5kbGVyRGF0YTxUPltdLCBTdGF0aWNNYXA8VD5dXG5cbmNvbnN0IGVtcHR5UGFyYW0gPSB7fVxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbmNvbnN0IG51bGxNYXRjaGVyOiBNYXRjaGVyPGFueT4gPSBbL14kLywgW10sIHt9XVxuXG5sZXQgd2lsZGNhcmRSZWdFeHBDYWNoZTogUmVjb3JkPHN0cmluZywgUmVnRXhwPiA9IHt9XG5mdW5jdGlvbiBidWlsZFdpbGRjYXJkUmVnRXhwKHBhdGg6IHN0cmluZyk6IFJlZ0V4cCB7XG4gIHJldHVybiAod2lsZGNhcmRSZWdFeHBDYWNoZVtwYXRoXSA/Pz0gbmV3IFJlZ0V4cChcbiAgICBwYXRoID09PSAnKicgPyAnJyA6IGBeJHtwYXRoLnJlcGxhY2UoL1xcL1xcKi8sICcoPzp8Ly4qKScpfSRgXG4gICkpXG59XG5cbmZ1bmN0aW9uIGNsZWFyV2lsZGNhcmRSZWdFeHBDYWNoZSgpIHtcbiAgd2lsZGNhcmRSZWdFeHBDYWNoZSA9IHt9XG59XG5cbmZ1bmN0aW9uIGJ1aWxkTWF0Y2hlckZyb21QcmVwcm9jZXNzZWRSb3V0ZXM8VD4ocm91dGVzOiBbc3RyaW5nLCBUW11dW10pOiBNYXRjaGVyPFQ+IHtcbiAgY29uc3QgdHJpZSA9IG5ldyBUcmllKClcbiAgY29uc3QgaGFuZGxlckRhdGE6IEhhbmRsZXJEYXRhPFQ+W10gPSBbXVxuICBpZiAocm91dGVzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBudWxsTWF0Y2hlclxuICB9XG5cbiAgY29uc3Qgcm91dGVzV2l0aFN0YXRpY1BhdGhGbGFnID0gcm91dGVzXG4gICAgLm1hcCgocm91dGUpID0+IFshL1xcKnxcXC86Ly50ZXN0KHJvdXRlWzBdKSwgLi4ucm91dGVdIGFzIFtib29sZWFuLCBzdHJpbmcsIFRbXV0pXG4gICAgLnNvcnQoKFtpc1N0YXRpY0EsIHBhdGhBXSwgW2lzU3RhdGljQiwgcGF0aEJdKSA9PlxuICAgICAgaXNTdGF0aWNBID8gMSA6IGlzU3RhdGljQiA/IC0xIDogcGF0aEEubGVuZ3RoIC0gcGF0aEIubGVuZ3RoXG4gICAgKVxuXG4gIGNvbnN0IHN0YXRpY01hcDogU3RhdGljTWFwPFQ+ID0ge31cbiAgZm9yIChsZXQgaSA9IDAsIGogPSAtMSwgbGVuID0gcm91dGVzV2l0aFN0YXRpY1BhdGhGbGFnLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgY29uc3QgW3BhdGhFcnJvckNoZWNrT25seSwgcGF0aCwgaGFuZGxlcnNdID0gcm91dGVzV2l0aFN0YXRpY1BhdGhGbGFnW2ldXG4gICAgaWYgKHBhdGhFcnJvckNoZWNrT25seSkge1xuICAgICAgc3RhdGljTWFwW3BhdGhdID0geyBoYW5kbGVycywgcGFyYW1zOiBlbXB0eVBhcmFtIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaisrXG4gICAgfVxuXG4gICAgbGV0IHBhcmFtTWFwXG4gICAgdHJ5IHtcbiAgICAgIHBhcmFtTWFwID0gdHJpZS5pbnNlcnQocGF0aCwgaiwgcGF0aEVycm9yQ2hlY2tPbmx5KVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRocm93IGUgPT09IFBBVEhfRVJST1IgPyBuZXcgVW5zdXBwb3J0ZWRQYXRoRXJyb3IocGF0aCkgOiBlXG4gICAgfVxuXG4gICAgaWYgKHBhdGhFcnJvckNoZWNrT25seSkge1xuICAgICAgY29udGludWVcbiAgICB9XG5cbiAgICBoYW5kbGVyRGF0YVtqXSA9XG4gICAgICBwYXJhbU1hcC5sZW5ndGggPT09IDAgPyBbeyBoYW5kbGVycywgcGFyYW1zOiBlbXB0eVBhcmFtIH0sIG51bGxdIDogW2hhbmRsZXJzLCBwYXJhbU1hcF1cbiAgfVxuXG4gIGNvbnN0IFtyZWdleHAsIGluZGV4UmVwbGFjZW1lbnRNYXAsIHBhcmFtUmVwbGFjZW1lbnRNYXBdID0gdHJpZS5idWlsZFJlZ0V4cCgpXG4gIGZvciAobGV0IGkgPSAwLCBsZW4gPSBoYW5kbGVyRGF0YS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGNvbnN0IHBhcmFtTWFwID0gaGFuZGxlckRhdGFbaV1bMV1cbiAgICBpZiAocGFyYW1NYXApIHtcbiAgICAgIGZvciAobGV0IGogPSAwLCBsZW4gPSBwYXJhbU1hcC5sZW5ndGg7IGogPCBsZW47IGorKykge1xuICAgICAgICBwYXJhbU1hcFtqXVsxXSA9IHBhcmFtUmVwbGFjZW1lbnRNYXBbcGFyYW1NYXBbal1bMV1dXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY29uc3QgaGFuZGxlck1hcDogSGFuZGxlckRhdGE8VD5bXSA9IFtdXG4gIC8vIHVzaW5nIGBpbmAgYmVjYXVzZSBpbmRleFJlcGxhY2VtZW50TWFwIGlzIGEgc3BhcnNlIGFycmF5XG4gIGZvciAoY29uc3QgaSBpbiBpbmRleFJlcGxhY2VtZW50TWFwKSB7XG4gICAgaGFuZGxlck1hcFtpXSA9IGhhbmRsZXJEYXRhW2luZGV4UmVwbGFjZW1lbnRNYXBbaV1dXG4gIH1cblxuICByZXR1cm4gW3JlZ2V4cCwgaGFuZGxlck1hcCwgc3RhdGljTWFwXSBhcyBNYXRjaGVyPFQ+XG59XG5cbmZ1bmN0aW9uIGZpbmRNaWRkbGV3YXJlPFQ+KFxuICBtaWRkbGV3YXJlOiBSZWNvcmQ8c3RyaW5nLCBUW10+IHwgdW5kZWZpbmVkLFxuICBwYXRoOiBzdHJpbmdcbik6IFRbXSB8IHVuZGVmaW5lZCB7XG4gIGlmICghbWlkZGxld2FyZSkge1xuICAgIHJldHVybiB1bmRlZmluZWRcbiAgfVxuXG4gIGZvciAoY29uc3QgayBvZiBPYmplY3Qua2V5cyhtaWRkbGV3YXJlKS5zb3J0KChhLCBiKSA9PiBiLmxlbmd0aCAtIGEubGVuZ3RoKSkge1xuICAgIGlmIChidWlsZFdpbGRjYXJkUmVnRXhwKGspLnRlc3QocGF0aCkpIHtcbiAgICAgIHJldHVybiBbLi4ubWlkZGxld2FyZVtrXV1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdW5kZWZpbmVkXG59XG5cbmV4cG9ydCBjbGFzcyBSZWdFeHBSb3V0ZXI8VD4gaW1wbGVtZW50cyBSb3V0ZXI8VD4ge1xuICBuYW1lOiBzdHJpbmcgPSAnUmVnRXhwUm91dGVyJ1xuICBtaWRkbGV3YXJlPzogUmVjb3JkPHN0cmluZywgUmVjb3JkPHN0cmluZywgVFtdPj5cbiAgcm91dGVzPzogUmVjb3JkPHN0cmluZywgUmVjb3JkPHN0cmluZywgVFtdPj5cblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLm1pZGRsZXdhcmUgPSB7IFtNRVRIT0RfTkFNRV9BTExdOiB7fSB9XG4gICAgdGhpcy5yb3V0ZXMgPSB7IFtNRVRIT0RfTkFNRV9BTExdOiB7fSB9XG4gIH1cblxuICBhZGQobWV0aG9kOiBzdHJpbmcsIHBhdGg6IHN0cmluZywgaGFuZGxlcjogVCkge1xuICAgIGNvbnN0IHsgbWlkZGxld2FyZSwgcm91dGVzIH0gPSB0aGlzXG5cbiAgICBpZiAoIW1pZGRsZXdhcmUgfHwgIXJvdXRlcykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW4gbm90IGFkZCBhIHJvdXRlIHNpbmNlIHRoZSBtYXRjaGVyIGlzIGFscmVhZHkgYnVpbHQuJylcbiAgICB9XG5cbiAgICBpZiAobWV0aG9kTmFtZXMuaW5kZXhPZihtZXRob2QpID09PSAtMSkgbWV0aG9kTmFtZXMucHVzaChtZXRob2QpXG4gICAgaWYgKCFtaWRkbGV3YXJlW21ldGhvZF0pIHtcbiAgICAgIDtbbWlkZGxld2FyZSwgcm91dGVzXS5mb3JFYWNoKChoYW5kbGVyTWFwKSA9PiB7XG4gICAgICAgIGhhbmRsZXJNYXBbbWV0aG9kXSA9IHt9XG4gICAgICAgIE9iamVjdC5rZXlzKGhhbmRsZXJNYXBbTUVUSE9EX05BTUVfQUxMXSkuZm9yRWFjaCgocCkgPT4ge1xuICAgICAgICAgIGhhbmRsZXJNYXBbbWV0aG9kXVtwXSA9IFsuLi5oYW5kbGVyTWFwW01FVEhPRF9OQU1FX0FMTF1bcF1dXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH1cblxuICAgIGlmIChwYXRoID09PSAnLyonKSB7XG4gICAgICBwYXRoID0gJyonXG4gICAgfVxuXG4gICAgaWYgKC9cXCokLy50ZXN0KHBhdGgpKSB7XG4gICAgICBjb25zdCByZSA9IGJ1aWxkV2lsZGNhcmRSZWdFeHAocGF0aClcbiAgICAgIGlmIChtZXRob2QgPT09IE1FVEhPRF9OQU1FX0FMTCkge1xuICAgICAgICBPYmplY3Qua2V5cyhtaWRkbGV3YXJlKS5mb3JFYWNoKChtKSA9PiB7XG4gICAgICAgICAgbWlkZGxld2FyZVttXVtwYXRoXSB8fD1cbiAgICAgICAgICAgIGZpbmRNaWRkbGV3YXJlKG1pZGRsZXdhcmVbbV0sIHBhdGgpIHx8XG4gICAgICAgICAgICBmaW5kTWlkZGxld2FyZShtaWRkbGV3YXJlW01FVEhPRF9OQU1FX0FMTF0sIHBhdGgpIHx8XG4gICAgICAgICAgICBbXVxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWlkZGxld2FyZVttZXRob2RdW3BhdGhdIHx8PVxuICAgICAgICAgIGZpbmRNaWRkbGV3YXJlKG1pZGRsZXdhcmVbbWV0aG9kXSwgcGF0aCkgfHxcbiAgICAgICAgICBmaW5kTWlkZGxld2FyZShtaWRkbGV3YXJlW01FVEhPRF9OQU1FX0FMTF0sIHBhdGgpIHx8XG4gICAgICAgICAgW11cbiAgICAgIH1cbiAgICAgIE9iamVjdC5rZXlzKG1pZGRsZXdhcmUpLmZvckVhY2goKG0pID0+IHtcbiAgICAgICAgaWYgKG1ldGhvZCA9PT0gTUVUSE9EX05BTUVfQUxMIHx8IG1ldGhvZCA9PT0gbSkge1xuICAgICAgICAgIE9iamVjdC5rZXlzKG1pZGRsZXdhcmVbbV0pLmZvckVhY2goKHApID0+IHtcbiAgICAgICAgICAgIHJlLnRlc3QocCkgJiYgbWlkZGxld2FyZVttXVtwXS5wdXNoKGhhbmRsZXIpXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfSlcblxuICAgICAgT2JqZWN0LmtleXMocm91dGVzKS5mb3JFYWNoKChtKSA9PiB7XG4gICAgICAgIGlmIChtZXRob2QgPT09IE1FVEhPRF9OQU1FX0FMTCB8fCBtZXRob2QgPT09IG0pIHtcbiAgICAgICAgICBPYmplY3Qua2V5cyhyb3V0ZXNbbV0pLmZvckVhY2goKHApID0+IHJlLnRlc3QocCkgJiYgcm91dGVzW21dW3BdLnB1c2goaGFuZGxlcikpXG4gICAgICAgIH1cbiAgICAgIH0pXG5cbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGNvbnN0IHBhdGhzID0gY2hlY2tPcHRpb25hbFBhcmFtZXRlcihwYXRoKSB8fCBbcGF0aF1cbiAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gcGF0aHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGNvbnN0IHBhdGggPSBwYXRoc1tpXVxuXG4gICAgICBPYmplY3Qua2V5cyhyb3V0ZXMpLmZvckVhY2goKG0pID0+IHtcbiAgICAgICAgaWYgKG1ldGhvZCA9PT0gTUVUSE9EX05BTUVfQUxMIHx8IG1ldGhvZCA9PT0gbSkge1xuICAgICAgICAgIHJvdXRlc1ttXVtwYXRoXSB8fD0gW1xuICAgICAgICAgICAgLi4uKGZpbmRNaWRkbGV3YXJlKG1pZGRsZXdhcmVbbV0sIHBhdGgpIHx8XG4gICAgICAgICAgICAgIGZpbmRNaWRkbGV3YXJlKG1pZGRsZXdhcmVbTUVUSE9EX05BTUVfQUxMXSwgcGF0aCkgfHxcbiAgICAgICAgICAgICAgW10pLFxuICAgICAgICAgIF1cbiAgICAgICAgICByb3V0ZXNbbV1bcGF0aF0ucHVzaChoYW5kbGVyKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIG1hdGNoKG1ldGhvZDogc3RyaW5nLCBwYXRoOiBzdHJpbmcpOiBSZXN1bHQ8VD4gfCBudWxsIHtcbiAgICBjbGVhcldpbGRjYXJkUmVnRXhwQ2FjaGUoKSAvLyBubyBsb25nZXIgdXNlZC5cblxuICAgIGNvbnN0IG1hdGNoZXJzID0gdGhpcy5idWlsZEFsbE1hdGNoZXJzKClcblxuICAgIHRoaXMubWF0Y2ggPSAobWV0aG9kLCBwYXRoKSA9PiB7XG4gICAgICBjb25zdCBtYXRjaGVyID0gbWF0Y2hlcnNbbWV0aG9kXVxuXG4gICAgICBjb25zdCBzdGF0aWNNYXRjaCA9IG1hdGNoZXJbMl1bcGF0aF1cbiAgICAgIGlmIChzdGF0aWNNYXRjaCkge1xuICAgICAgICByZXR1cm4gc3RhdGljTWF0Y2hcbiAgICAgIH1cblxuICAgICAgY29uc3QgbWF0Y2ggPSBwYXRoLm1hdGNoKG1hdGNoZXJbMF0pXG4gICAgICBpZiAoIW1hdGNoKSB7XG4gICAgICAgIHJldHVybiBudWxsXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGluZGV4ID0gbWF0Y2guaW5kZXhPZignJywgMSlcbiAgICAgIGNvbnN0IFtoYW5kbGVycywgcGFyYW1NYXBdID0gbWF0Y2hlclsxXVtpbmRleF1cbiAgICAgIGlmICghcGFyYW1NYXApIHtcbiAgICAgICAgcmV0dXJuIGhhbmRsZXJzXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHBhcmFtczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9XG4gICAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gcGFyYW1NYXAubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgcGFyYW1zW3BhcmFtTWFwW2ldWzBdXSA9IG1hdGNoW3BhcmFtTWFwW2ldWzFdXVxuICAgICAgfVxuXG4gICAgICByZXR1cm4geyBoYW5kbGVycywgcGFyYW1zIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5tYXRjaChtZXRob2QsIHBhdGgpXG4gIH1cblxuICBwcml2YXRlIGJ1aWxkQWxsTWF0Y2hlcnMoKTogUmVjb3JkPHN0cmluZywgTWF0Y2hlcjxUPj4ge1xuICAgIGNvbnN0IG1hdGNoZXJzOiBSZWNvcmQ8c3RyaW5nLCBNYXRjaGVyPFQ+PiA9IHt9XG5cbiAgICBtZXRob2ROYW1lcy5mb3JFYWNoKChtZXRob2QpID0+IHtcbiAgICAgIG1hdGNoZXJzW21ldGhvZF0gPSB0aGlzLmJ1aWxkTWF0Y2hlcihtZXRob2QpIHx8IG1hdGNoZXJzW01FVEhPRF9OQU1FX0FMTF1cbiAgICB9KVxuXG4gICAgLy8gUmVsZWFzZSBjYWNoZVxuICAgIHRoaXMubWlkZGxld2FyZSA9IHRoaXMucm91dGVzID0gdW5kZWZpbmVkXG5cbiAgICByZXR1cm4gbWF0Y2hlcnNcbiAgfVxuXG4gIHByaXZhdGUgYnVpbGRNYXRjaGVyKG1ldGhvZDogc3RyaW5nKTogTWF0Y2hlcjxUPiB8IG51bGwge1xuICAgIGNvbnN0IHJvdXRlczogW3N0cmluZywgVFtdXVtdID0gW11cblxuICAgIGxldCBoYXNPd25Sb3V0ZSA9IG1ldGhvZCA9PT0gTUVUSE9EX05BTUVfQUxMXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1ub24tbnVsbC1hc3NlcnRpb25cbiAgICA7W3RoaXMubWlkZGxld2FyZSEsIHRoaXMucm91dGVzIV0uZm9yRWFjaCgocikgPT4ge1xuICAgICAgY29uc3Qgb3duUm91dGUgPSByW21ldGhvZF1cbiAgICAgICAgPyBPYmplY3Qua2V5cyhyW21ldGhvZF0pLm1hcCgocGF0aCkgPT4gW3BhdGgsIHJbbWV0aG9kXVtwYXRoXV0pXG4gICAgICAgIDogW11cbiAgICAgIGlmIChvd25Sb3V0ZS5sZW5ndGggIT09IDApIHtcbiAgICAgICAgaGFzT3duUm91dGUgfHw9IHRydWVcbiAgICAgICAgcm91dGVzLnB1c2goLi4uKG93blJvdXRlIGFzIFtzdHJpbmcsIFRbXV1bXSkpXG4gICAgICB9IGVsc2UgaWYgKG1ldGhvZCAhPT0gTUVUSE9EX05BTUVfQUxMKSB7XG4gICAgICAgIHJvdXRlcy5wdXNoKFxuICAgICAgICAgIC4uLihPYmplY3Qua2V5cyhyW01FVEhPRF9OQU1FX0FMTF0pLm1hcCgocGF0aCkgPT4gW3BhdGgsIHJbTUVUSE9EX05BTUVfQUxMXVtwYXRoXV0pIGFzIFtcbiAgICAgICAgICAgIHN0cmluZyxcbiAgICAgICAgICAgIFRbXVxuICAgICAgICAgIF1bXSlcbiAgICAgICAgKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICBpZiAoIWhhc093blJvdXRlKSB7XG4gICAgICByZXR1cm4gbnVsbFxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYnVpbGRNYXRjaGVyRnJvbVByZXByb2Nlc3NlZFJvdXRlcyhyb3V0ZXMpXG4gICAgfVxuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsb0RBQW9ELEdBRXBELFNBQVMsZUFBZSxFQUFFLE9BQU8sRUFBRSxvQkFBb0IsUUFBUSxrQkFBaUI7QUFDaEYsU0FBUyxzQkFBc0IsUUFBUSxxQkFBb0I7QUFDM0QsU0FBUyxVQUFVLFFBQVEsWUFBVztBQUV0QyxTQUFTLElBQUksUUFBUSxZQUFXO0FBRWhDLE1BQU0sY0FBYztJQUFDO09BQW9CO0NBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxTQUFXLE9BQU8sV0FBVztBQU1wRixNQUFNLGFBQWEsQ0FBQztBQUNwQiw4REFBOEQ7QUFDOUQsTUFBTSxjQUE0QjtJQUFDO0lBQU0sRUFBRTtJQUFFLENBQUM7Q0FBRTtBQUVoRCxJQUFJLHNCQUE4QyxDQUFDO0FBQ25ELFNBQVMsb0JBQW9CLElBQVksRUFBVTtJQUNqRCxPQUFRLG1CQUFtQixDQUFDLEtBQUssS0FBSyxJQUFJLE9BQ3hDLFNBQVMsTUFBTSxLQUFLLENBQUMsQ0FBQyxFQUFFLEtBQUssT0FBTyxDQUFDLFFBQVEsWUFBWSxDQUFDLENBQUM7QUFFL0Q7QUFFQSxTQUFTLDJCQUEyQjtJQUNsQyxzQkFBc0IsQ0FBQztBQUN6QjtBQUVBLFNBQVMsbUNBQXNDLE1BQXVCLEVBQWM7SUFDbEYsTUFBTSxPQUFPLElBQUk7SUFDakIsTUFBTSxjQUFnQyxFQUFFO0lBQ3hDLElBQUksT0FBTyxNQUFNLEtBQUssR0FBRztRQUN2QixPQUFPO0lBQ1QsQ0FBQztJQUVELE1BQU0sMkJBQTJCLE9BQzlCLEdBQUcsQ0FBQyxDQUFDLFFBQVU7WUFBQyxDQUFDLFNBQVMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFO2VBQU07U0FBTSxFQUNuRCxJQUFJLENBQUMsQ0FBQyxDQUFDLFdBQVcsTUFBTSxFQUFFLENBQUMsV0FBVyxNQUFNLEdBQzNDLFlBQVksSUFBSSxZQUFZLENBQUMsSUFBSSxNQUFNLE1BQU0sR0FBRyxNQUFNLE1BQU07SUFHaEUsTUFBTSxZQUEwQixDQUFDO0lBQ2pDLElBQUssSUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsTUFBTSx5QkFBeUIsTUFBTSxFQUFFLElBQUksS0FBSyxJQUFLO1FBQzNFLE1BQU0sQ0FBQyxvQkFBb0IsTUFBTSxTQUFTLEdBQUcsd0JBQXdCLENBQUMsRUFBRTtRQUN4RSxJQUFJLG9CQUFvQjtZQUN0QixTQUFTLENBQUMsS0FBSyxHQUFHO2dCQUFFO2dCQUFVLFFBQVE7WUFBVztRQUNuRCxPQUFPO1lBQ0w7UUFDRixDQUFDO1FBRUQsSUFBSTtRQUNKLElBQUk7WUFDRixXQUFXLEtBQUssTUFBTSxDQUFDLE1BQU0sR0FBRztRQUNsQyxFQUFFLE9BQU8sR0FBRztZQUNWLE1BQU0sTUFBTSxhQUFhLElBQUkscUJBQXFCLFFBQVEsQ0FBQyxDQUFBO1FBQzdEO1FBRUEsSUFBSSxvQkFBb0I7WUFDdEIsUUFBUTtRQUNWLENBQUM7UUFFRCxXQUFXLENBQUMsRUFBRSxHQUNaLFNBQVMsTUFBTSxLQUFLLElBQUk7WUFBQztnQkFBRTtnQkFBVSxRQUFRO1lBQVc7WUFBRyxJQUFJO1NBQUMsR0FBRztZQUFDO1lBQVU7U0FBUztJQUMzRjtJQUVBLE1BQU0sQ0FBQyxRQUFRLHFCQUFxQixvQkFBb0IsR0FBRyxLQUFLLFdBQVc7SUFDM0UsSUFBSyxJQUFJLElBQUksR0FBRyxNQUFNLFlBQVksTUFBTSxFQUFFLElBQUksS0FBSyxJQUFLO1FBQ3RELE1BQU0sV0FBVyxXQUFXLENBQUMsRUFBRSxDQUFDLEVBQUU7UUFDbEMsSUFBSSxVQUFVO1lBQ1osSUFBSyxJQUFJLElBQUksR0FBRyxNQUFNLFNBQVMsTUFBTSxFQUFFLElBQUksS0FBSyxJQUFLO2dCQUNuRCxRQUFRLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztZQUN0RDtRQUNGLENBQUM7SUFDSDtJQUVBLE1BQU0sYUFBK0IsRUFBRTtJQUN2QywyREFBMkQ7SUFDM0QsSUFBSyxNQUFNLEtBQUssb0JBQXFCO1FBQ25DLFVBQVUsQ0FBQyxFQUFFLEdBQUcsV0FBVyxDQUFDLG1CQUFtQixDQUFDLEVBQUUsQ0FBQztJQUNyRDtJQUVBLE9BQU87UUFBQztRQUFRO1FBQVk7S0FBVTtBQUN4QztBQUVBLFNBQVMsZUFDUCxVQUEyQyxFQUMzQyxJQUFZLEVBQ0s7SUFDakIsSUFBSSxDQUFDLFlBQVk7UUFDZixPQUFPO0lBQ1QsQ0FBQztJQUVELEtBQUssTUFBTSxLQUFLLE9BQU8sSUFBSSxDQUFDLFlBQVksSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFNLEVBQUUsTUFBTSxHQUFHLEVBQUUsTUFBTSxFQUFHO1FBQzNFLElBQUksb0JBQW9CLEdBQUcsSUFBSSxDQUFDLE9BQU87WUFDckMsT0FBTzttQkFBSSxVQUFVLENBQUMsRUFBRTthQUFDO1FBQzNCLENBQUM7SUFDSDtJQUVBLE9BQU87QUFDVDtBQUVBLE9BQU8sTUFBTTtJQUNYLE9BQWUsZUFBYztJQUM3QixXQUFnRDtJQUNoRCxPQUE0QztJQUU1QyxhQUFjO1FBQ1osSUFBSSxDQUFDLFVBQVUsR0FBRztZQUFFLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUFFO1FBQzFDLElBQUksQ0FBQyxNQUFNLEdBQUc7WUFBRSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFBRTtJQUN4QztJQUVBLElBQUksTUFBYyxFQUFFLElBQVksRUFBRSxPQUFVLEVBQUU7UUFDNUMsTUFBTSxFQUFFLFdBQVUsRUFBRSxPQUFNLEVBQUUsR0FBRyxJQUFJO1FBRW5DLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUTtZQUMxQixNQUFNLElBQUksTUFBTSwyREFBMEQ7UUFDNUUsQ0FBQztRQUVELElBQUksWUFBWSxPQUFPLENBQUMsWUFBWSxDQUFDLEdBQUcsWUFBWSxJQUFJLENBQUM7UUFDekQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUU7WUFDdEI7Z0JBQUM7Z0JBQVk7YUFBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLGFBQWU7Z0JBQzVDLFVBQVUsQ0FBQyxPQUFPLEdBQUcsQ0FBQztnQkFDdEIsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLGdCQUFnQixFQUFFLE9BQU8sQ0FBQyxDQUFDLElBQU07b0JBQ3RELFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRSxHQUFHOzJCQUFJLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFO3FCQUFDO2dCQUM3RDtZQUNGO1FBQ0YsQ0FBQztRQUVELElBQUksU0FBUyxNQUFNO1lBQ2pCLE9BQU87UUFDVCxDQUFDO1FBRUQsSUFBSSxNQUFNLElBQUksQ0FBQyxPQUFPO1lBQ3BCLE1BQU0sS0FBSyxvQkFBb0I7WUFDL0IsSUFBSSxXQUFXLGlCQUFpQjtnQkFDOUIsT0FBTyxJQUFJLENBQUMsWUFBWSxPQUFPLENBQUMsQ0FBQyxJQUFNO29CQUNyQyxVQUFVLENBQUMsRUFBRSxDQUFDLEtBQUssS0FDakIsZUFBZSxVQUFVLENBQUMsRUFBRSxFQUFFLFNBQzlCLGVBQWUsVUFBVSxDQUFDLGdCQUFnQixFQUFFLFNBQzVDLEVBQUU7Z0JBQ047WUFDRixPQUFPO2dCQUNMLFVBQVUsQ0FBQyxPQUFPLENBQUMsS0FBSyxLQUN0QixlQUFlLFVBQVUsQ0FBQyxPQUFPLEVBQUUsU0FDbkMsZUFBZSxVQUFVLENBQUMsZ0JBQWdCLEVBQUUsU0FDNUMsRUFBRTtZQUNOLENBQUM7WUFDRCxPQUFPLElBQUksQ0FBQyxZQUFZLE9BQU8sQ0FBQyxDQUFDLElBQU07Z0JBQ3JDLElBQUksV0FBVyxtQkFBbUIsV0FBVyxHQUFHO29CQUM5QyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDLElBQU07d0JBQ3hDLEdBQUcsSUFBSSxDQUFDLE1BQU0sVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDO29CQUN0QztnQkFDRixDQUFDO1lBQ0g7WUFFQSxPQUFPLElBQUksQ0FBQyxRQUFRLE9BQU8sQ0FBQyxDQUFDLElBQU07Z0JBQ2pDLElBQUksV0FBVyxtQkFBbUIsV0FBVyxHQUFHO29CQUM5QyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDLElBQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxNQUFNLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUM7Z0JBQ3hFLENBQUM7WUFDSDtZQUVBO1FBQ0YsQ0FBQztRQUVELE1BQU0sUUFBUSx1QkFBdUIsU0FBUztZQUFDO1NBQUs7UUFDcEQsSUFBSyxJQUFJLElBQUksR0FBRyxNQUFNLE1BQU0sTUFBTSxFQUFFLElBQUksS0FBSyxJQUFLO1lBQ2hELE1BQU0sT0FBTyxLQUFLLENBQUMsRUFBRTtZQUVyQixPQUFPLElBQUksQ0FBQyxRQUFRLE9BQU8sQ0FBQyxDQUFDLElBQU07Z0JBQ2pDLElBQUksV0FBVyxtQkFBbUIsV0FBVyxHQUFHO29CQUM5QyxNQUFNLENBQUMsRUFBRSxDQUFDLEtBQUssS0FBSzsyQkFDZCxlQUFlLFVBQVUsQ0FBQyxFQUFFLEVBQUUsU0FDaEMsZUFBZSxVQUFVLENBQUMsZ0JBQWdCLEVBQUUsU0FDNUMsRUFBRTtxQkFDTDtvQkFDRCxNQUFNLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7Z0JBQ3ZCLENBQUM7WUFDSDtRQUNGO0lBQ0Y7SUFFQSxNQUFNLE1BQWMsRUFBRSxJQUFZLEVBQW9CO1FBQ3BELDJCQUEyQixrQkFBa0I7O1FBRTdDLE1BQU0sV0FBVyxJQUFJLENBQUMsZ0JBQWdCO1FBRXRDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxRQUFRLE9BQVM7WUFDN0IsTUFBTSxVQUFVLFFBQVEsQ0FBQyxPQUFPO1lBRWhDLE1BQU0sY0FBYyxPQUFPLENBQUMsRUFBRSxDQUFDLEtBQUs7WUFDcEMsSUFBSSxhQUFhO2dCQUNmLE9BQU87WUFDVCxDQUFDO1lBRUQsTUFBTSxRQUFRLEtBQUssS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ25DLElBQUksQ0FBQyxPQUFPO2dCQUNWLE9BQU8sSUFBSTtZQUNiLENBQUM7WUFFRCxNQUFNLFFBQVEsTUFBTSxPQUFPLENBQUMsSUFBSTtZQUNoQyxNQUFNLENBQUMsVUFBVSxTQUFTLEdBQUcsT0FBTyxDQUFDLEVBQUUsQ0FBQyxNQUFNO1lBQzlDLElBQUksQ0FBQyxVQUFVO2dCQUNiLE9BQU87WUFDVCxDQUFDO1lBRUQsTUFBTSxTQUFpQyxDQUFDO1lBQ3hDLElBQUssSUFBSSxJQUFJLEdBQUcsTUFBTSxTQUFTLE1BQU0sRUFBRSxJQUFJLEtBQUssSUFBSztnQkFDbkQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO1lBQ2hEO1lBRUEsT0FBTztnQkFBRTtnQkFBVTtZQUFPO1FBQzVCO1FBRUEsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVE7SUFDNUI7SUFFUSxtQkFBK0M7UUFDckQsTUFBTSxXQUF1QyxDQUFDO1FBRTlDLFlBQVksT0FBTyxDQUFDLENBQUMsU0FBVztZQUM5QixRQUFRLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxRQUFRLENBQUMsZ0JBQWdCO1FBQzNFO1FBRUEsZ0JBQWdCO1FBQ2hCLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRztRQUVoQyxPQUFPO0lBQ1Q7SUFFUSxhQUFhLE1BQWMsRUFBcUI7UUFDdEQsTUFBTSxTQUEwQixFQUFFO1FBRWxDLElBQUksY0FBYyxXQUFXO1FBRTVCO1lBQUMsSUFBSSxDQUFDLFVBQVU7WUFBRyxJQUFJLENBQUMsTUFBTTtTQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBTTtZQUMvQyxNQUFNLFdBQVcsQ0FBQyxDQUFDLE9BQU8sR0FDdEIsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsQ0FBQyxPQUFTO29CQUFDO29CQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSztpQkFBQyxJQUM1RCxFQUFFO1lBQ04sSUFBSSxTQUFTLE1BQU0sS0FBSyxHQUFHO2dCQUN6QixnQkFBZ0IsSUFBSTtnQkFDcEIsT0FBTyxJQUFJLElBQUs7WUFDbEIsT0FBTyxJQUFJLFdBQVcsaUJBQWlCO2dCQUNyQyxPQUFPLElBQUksSUFDTCxPQUFPLElBQUksQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLEVBQUUsR0FBRyxDQUFDLENBQUMsT0FBUzt3QkFBQzt3QkFBTSxDQUFDLENBQUMsZ0JBQWdCLENBQUMsS0FBSztxQkFBQztZQUt0RixDQUFDO1FBQ0g7UUFFQSxJQUFJLENBQUMsYUFBYTtZQUNoQixPQUFPLElBQUk7UUFDYixPQUFPO1lBQ0wsT0FBTyxtQ0FBbUM7UUFDNUMsQ0FBQztJQUNIO0FBQ0YsQ0FBQyJ9