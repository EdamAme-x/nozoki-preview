import { decodeURIComponent_ } from './url.ts';
export const parse = (cookie)=>{
    const pairs = cookie.split(/;\s*/g);
    const parsedCookie = {};
    for(let i = 0, len = pairs.length; i < len; i++){
        const pair = pairs[i].split(/\s*=\s*([^\s]+)/);
        parsedCookie[pair[0]] = decodeURIComponent_(pair[1]);
    }
    return parsedCookie;
};
export const serialize = (name, value, opt = {})=>{
    value = encodeURIComponent(value);
    let cookie = `${name}=${value}`;
    if (opt && typeof opt.maxAge === 'number' && opt.maxAge >= 0) {
        cookie += `; Max-Age=${Math.floor(opt.maxAge)}`;
    }
    if (opt.domain) {
        cookie += '; Domain=' + opt.domain;
    }
    if (opt.path) {
        cookie += '; Path=' + opt.path;
    }
    if (opt.expires) {
        cookie += '; Expires=' + opt.expires.toUTCString();
    }
    if (opt.httpOnly) {
        cookie += '; HttpOnly';
    }
    if (opt.secure) {
        cookie += '; Secure';
    }
    if (opt.sameSite) {
        cookie += `; SameSite=${opt.sameSite}`;
    }
    return cookie;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4yLjcvdXRpbHMvY29va2llLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGRlY29kZVVSSUNvbXBvbmVudF8gfSBmcm9tICcuL3VybC50cydcblxuZXhwb3J0IHR5cGUgQ29va2llID0gUmVjb3JkPHN0cmluZywgc3RyaW5nPlxuZXhwb3J0IHR5cGUgQ29va2llT3B0aW9ucyA9IHtcbiAgZG9tYWluPzogc3RyaW5nXG4gIGV4cGlyZXM/OiBEYXRlXG4gIGh0dHBPbmx5PzogYm9vbGVhblxuICBtYXhBZ2U/OiBudW1iZXJcbiAgcGF0aD86IHN0cmluZ1xuICBzZWN1cmU/OiBib29sZWFuXG4gIHNpZ25lZD86IGJvb2xlYW5cbiAgc2FtZVNpdGU/OiAnU3RyaWN0JyB8ICdMYXgnIHwgJ05vbmUnXG59XG5cbmV4cG9ydCBjb25zdCBwYXJzZSA9IChjb29raWU6IHN0cmluZyk6IENvb2tpZSA9PiB7XG4gIGNvbnN0IHBhaXJzID0gY29va2llLnNwbGl0KC87XFxzKi9nKVxuICBjb25zdCBwYXJzZWRDb29raWU6IENvb2tpZSA9IHt9XG4gIGZvciAobGV0IGkgPSAwLCBsZW4gPSBwYWlycy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGNvbnN0IHBhaXIgPSBwYWlyc1tpXS5zcGxpdCgvXFxzKj1cXHMqKFteXFxzXSspLylcbiAgICBwYXJzZWRDb29raWVbcGFpclswXV0gPSBkZWNvZGVVUklDb21wb25lbnRfKHBhaXJbMV0pXG4gIH1cbiAgcmV0dXJuIHBhcnNlZENvb2tpZVxufVxuXG5leHBvcnQgY29uc3Qgc2VyaWFsaXplID0gKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZywgb3B0OiBDb29raWVPcHRpb25zID0ge30pOiBzdHJpbmcgPT4ge1xuICB2YWx1ZSA9IGVuY29kZVVSSUNvbXBvbmVudCh2YWx1ZSlcbiAgbGV0IGNvb2tpZSA9IGAke25hbWV9PSR7dmFsdWV9YFxuXG4gIGlmIChvcHQgJiYgdHlwZW9mIG9wdC5tYXhBZ2UgPT09ICdudW1iZXInICYmIG9wdC5tYXhBZ2UgPj0gMCkge1xuICAgIGNvb2tpZSArPSBgOyBNYXgtQWdlPSR7TWF0aC5mbG9vcihvcHQubWF4QWdlKX1gXG4gIH1cblxuICBpZiAob3B0LmRvbWFpbikge1xuICAgIGNvb2tpZSArPSAnOyBEb21haW49JyArIG9wdC5kb21haW5cbiAgfVxuXG4gIGlmIChvcHQucGF0aCkge1xuICAgIGNvb2tpZSArPSAnOyBQYXRoPScgKyBvcHQucGF0aFxuICB9XG5cbiAgaWYgKG9wdC5leHBpcmVzKSB7XG4gICAgY29va2llICs9ICc7IEV4cGlyZXM9JyArIG9wdC5leHBpcmVzLnRvVVRDU3RyaW5nKClcbiAgfVxuXG4gIGlmIChvcHQuaHR0cE9ubHkpIHtcbiAgICBjb29raWUgKz0gJzsgSHR0cE9ubHknXG4gIH1cblxuICBpZiAob3B0LnNlY3VyZSkge1xuICAgIGNvb2tpZSArPSAnOyBTZWN1cmUnXG4gIH1cblxuICBpZiAob3B0LnNhbWVTaXRlKSB7XG4gICAgY29va2llICs9IGA7IFNhbWVTaXRlPSR7b3B0LnNhbWVTaXRlfWBcbiAgfVxuXG4gIHJldHVybiBjb29raWVcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTLG1CQUFtQixRQUFRLFdBQVU7QUFjOUMsT0FBTyxNQUFNLFFBQVEsQ0FBQyxTQUEyQjtJQUMvQyxNQUFNLFFBQVEsT0FBTyxLQUFLLENBQUM7SUFDM0IsTUFBTSxlQUF1QixDQUFDO0lBQzlCLElBQUssSUFBSSxJQUFJLEdBQUcsTUFBTSxNQUFNLE1BQU0sRUFBRSxJQUFJLEtBQUssSUFBSztRQUNoRCxNQUFNLE9BQU8sS0FBSyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUM7UUFDNUIsWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxvQkFBb0IsSUFBSSxDQUFDLEVBQUU7SUFDckQ7SUFDQSxPQUFPO0FBQ1QsRUFBQztBQUVELE9BQU8sTUFBTSxZQUFZLENBQUMsTUFBYyxPQUFlLE1BQXFCLENBQUMsQ0FBQyxHQUFhO0lBQ3pGLFFBQVEsbUJBQW1CO0lBQzNCLElBQUksU0FBUyxDQUFDLEVBQUUsS0FBSyxDQUFDLEVBQUUsTUFBTSxDQUFDO0lBRS9CLElBQUksT0FBTyxPQUFPLElBQUksTUFBTSxLQUFLLFlBQVksSUFBSSxNQUFNLElBQUksR0FBRztRQUM1RCxVQUFVLENBQUMsVUFBVSxFQUFFLEtBQUssS0FBSyxDQUFDLElBQUksTUFBTSxFQUFFLENBQUM7SUFDakQsQ0FBQztJQUVELElBQUksSUFBSSxNQUFNLEVBQUU7UUFDZCxVQUFVLGNBQWMsSUFBSSxNQUFNO0lBQ3BDLENBQUM7SUFFRCxJQUFJLElBQUksSUFBSSxFQUFFO1FBQ1osVUFBVSxZQUFZLElBQUksSUFBSTtJQUNoQyxDQUFDO0lBRUQsSUFBSSxJQUFJLE9BQU8sRUFBRTtRQUNmLFVBQVUsZUFBZSxJQUFJLE9BQU8sQ0FBQyxXQUFXO0lBQ2xELENBQUM7SUFFRCxJQUFJLElBQUksUUFBUSxFQUFFO1FBQ2hCLFVBQVU7SUFDWixDQUFDO0lBRUQsSUFBSSxJQUFJLE1BQU0sRUFBRTtRQUNkLFVBQVU7SUFDWixDQUFDO0lBRUQsSUFBSSxJQUFJLFFBQVEsRUFBRTtRQUNoQixVQUFVLENBQUMsV0FBVyxFQUFFLElBQUksUUFBUSxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQUVELE9BQU87QUFDVCxFQUFDIn0=