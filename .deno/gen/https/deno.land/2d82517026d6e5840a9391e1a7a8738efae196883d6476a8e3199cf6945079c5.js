export const getMimeType = (filename)=>{
    const regexp = /\.([a-zA-Z0-9]+?)$/;
    const match = filename.match(regexp);
    if (!match) return;
    let mimeType = mimes[match[1]];
    if (mimeType && mimeType.startsWith('text') || mimeType === 'application/json') {
        mimeType += '; charset=utf-8';
    }
    return mimeType;
};
const mimes = {
    aac: 'audio/aac',
    abw: 'application/x-abiword',
    arc: 'application/x-freearc',
    avi: 'video/x-msvideo',
    avif: 'image/avif',
    av1: 'video/av1',
    azw: 'application/vnd.amazon.ebook',
    bin: 'application/octet-stream',
    bmp: 'image/bmp',
    bz: 'application/x-bzip',
    bz2: 'application/x-bzip2',
    csh: 'application/x-csh',
    css: 'text/css',
    csv: 'text/csv',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    eot: 'application/vnd.ms-fontobject',
    epub: 'application/epub+zip',
    gif: 'image/gif',
    gz: 'application/gzip',
    htm: 'text/html',
    html: 'text/html',
    ico: 'image/x-icon',
    ics: 'text/calendar',
    jar: 'application/java-archive',
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    js: 'text/javascript',
    json: 'application/json',
    jsonld: 'application/ld+json',
    map: 'application/json',
    mid: 'audio/x-midi',
    midi: 'audio/x-midi',
    mjs: 'text/javascript',
    mp3: 'audio/mpeg',
    mp4: 'video/mp4',
    mpeg: 'video/mpeg',
    mpkg: 'application/vnd.apple.installer+xml',
    odp: 'application/vnd.oasis.opendocument.presentation',
    ods: 'application/vnd.oasis.opendocument.spreadsheet',
    odt: 'application/vnd.oasis.opendocument.text',
    oga: 'audio/ogg',
    ogv: 'video/ogg',
    ogx: 'application/ogg',
    opus: 'audio/opus',
    otf: 'font/otf',
    pdf: 'application/pdf',
    php: 'application/php',
    png: 'image/png',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    rtf: 'application/rtf',
    sh: 'application/x-sh',
    svg: 'image/svg+xml',
    swf: 'application/x-shockwave-flash',
    tar: 'application/x-tar',
    tif: 'image/tiff',
    tiff: 'image/tiff',
    ts: 'video/mp2t',
    ttf: 'font/ttf',
    txt: 'text/plain',
    vsd: 'application/vnd.visio',
    wasm: 'application/wasm',
    webm: 'video/webm',
    weba: 'audio/webm',
    webp: 'image/webp',
    woff: 'font/woff',
    woff2: 'font/woff2',
    xhtml: 'application/xhtml+xml',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xml: 'application/xml',
    xul: 'application/vnd.mozilla.xul+xml',
    zip: 'application/zip',
    '3gp': 'video/3gpp',
    '3g2': 'video/3gpp2',
    '7z': 'application/x-7z-compressed',
    gltf: 'model/gltf+json',
    glb: 'model/gltf-binary'
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wL3V0aWxzL21pbWUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IGdldE1pbWVUeXBlID0gKGZpbGVuYW1lOiBzdHJpbmcpOiBzdHJpbmcgfCB1bmRlZmluZWQgPT4ge1xuICBjb25zdCByZWdleHAgPSAvXFwuKFthLXpBLVowLTldKz8pJC9cbiAgY29uc3QgbWF0Y2ggPSBmaWxlbmFtZS5tYXRjaChyZWdleHApXG4gIGlmICghbWF0Y2gpIHJldHVyblxuICBsZXQgbWltZVR5cGUgPSBtaW1lc1ttYXRjaFsxXV1cbiAgaWYgKChtaW1lVHlwZSAmJiBtaW1lVHlwZS5zdGFydHNXaXRoKCd0ZXh0JykpIHx8IG1pbWVUeXBlID09PSAnYXBwbGljYXRpb24vanNvbicpIHtcbiAgICBtaW1lVHlwZSArPSAnOyBjaGFyc2V0PXV0Zi04J1xuICB9XG4gIHJldHVybiBtaW1lVHlwZVxufVxuXG5jb25zdCBtaW1lczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgYWFjOiAnYXVkaW8vYWFjJyxcbiAgYWJ3OiAnYXBwbGljYXRpb24veC1hYml3b3JkJyxcbiAgYXJjOiAnYXBwbGljYXRpb24veC1mcmVlYXJjJyxcbiAgYXZpOiAndmlkZW8veC1tc3ZpZGVvJyxcbiAgYXZpZjogJ2ltYWdlL2F2aWYnLFxuICBhdjE6ICd2aWRlby9hdjEnLFxuICBhenc6ICdhcHBsaWNhdGlvbi92bmQuYW1hem9uLmVib29rJyxcbiAgYmluOiAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJyxcbiAgYm1wOiAnaW1hZ2UvYm1wJyxcbiAgYno6ICdhcHBsaWNhdGlvbi94LWJ6aXAnLFxuICBiejI6ICdhcHBsaWNhdGlvbi94LWJ6aXAyJyxcbiAgY3NoOiAnYXBwbGljYXRpb24veC1jc2gnLFxuICBjc3M6ICd0ZXh0L2NzcycsXG4gIGNzdjogJ3RleHQvY3N2JyxcbiAgZG9jOiAnYXBwbGljYXRpb24vbXN3b3JkJyxcbiAgZG9jeDogJ2FwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC53b3JkcHJvY2Vzc2luZ21sLmRvY3VtZW50JyxcbiAgZW90OiAnYXBwbGljYXRpb24vdm5kLm1zLWZvbnRvYmplY3QnLFxuICBlcHViOiAnYXBwbGljYXRpb24vZXB1Yit6aXAnLFxuICBnaWY6ICdpbWFnZS9naWYnLFxuICBnejogJ2FwcGxpY2F0aW9uL2d6aXAnLFxuICBodG06ICd0ZXh0L2h0bWwnLFxuICBodG1sOiAndGV4dC9odG1sJyxcbiAgaWNvOiAnaW1hZ2UveC1pY29uJyxcbiAgaWNzOiAndGV4dC9jYWxlbmRhcicsXG4gIGphcjogJ2FwcGxpY2F0aW9uL2phdmEtYXJjaGl2ZScsXG4gIGpwZWc6ICdpbWFnZS9qcGVnJyxcbiAganBnOiAnaW1hZ2UvanBlZycsXG4gIGpzOiAndGV4dC9qYXZhc2NyaXB0JyxcbiAganNvbjogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICBqc29ubGQ6ICdhcHBsaWNhdGlvbi9sZCtqc29uJyxcbiAgbWFwOiAnYXBwbGljYXRpb24vanNvbicsXG4gIG1pZDogJ2F1ZGlvL3gtbWlkaScsXG4gIG1pZGk6ICdhdWRpby94LW1pZGknLFxuICBtanM6ICd0ZXh0L2phdmFzY3JpcHQnLFxuICBtcDM6ICdhdWRpby9tcGVnJyxcbiAgbXA0OiAndmlkZW8vbXA0JyxcbiAgbXBlZzogJ3ZpZGVvL21wZWcnLFxuICBtcGtnOiAnYXBwbGljYXRpb24vdm5kLmFwcGxlLmluc3RhbGxlcit4bWwnLFxuICBvZHA6ICdhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LnByZXNlbnRhdGlvbicsXG4gIG9kczogJ2FwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQuc3ByZWFkc2hlZXQnLFxuICBvZHQ6ICdhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LnRleHQnLFxuICBvZ2E6ICdhdWRpby9vZ2cnLFxuICBvZ3Y6ICd2aWRlby9vZ2cnLFxuICBvZ3g6ICdhcHBsaWNhdGlvbi9vZ2cnLFxuICBvcHVzOiAnYXVkaW8vb3B1cycsXG4gIG90ZjogJ2ZvbnQvb3RmJyxcbiAgcGRmOiAnYXBwbGljYXRpb24vcGRmJyxcbiAgcGhwOiAnYXBwbGljYXRpb24vcGhwJyxcbiAgcG5nOiAnaW1hZ2UvcG5nJyxcbiAgcHB0OiAnYXBwbGljYXRpb24vdm5kLm1zLXBvd2VycG9pbnQnLFxuICBwcHR4OiAnYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LnByZXNlbnRhdGlvbm1sLnByZXNlbnRhdGlvbicsXG4gIHJ0ZjogJ2FwcGxpY2F0aW9uL3J0ZicsXG4gIHNoOiAnYXBwbGljYXRpb24veC1zaCcsXG4gIHN2ZzogJ2ltYWdlL3N2Zyt4bWwnLFxuICBzd2Y6ICdhcHBsaWNhdGlvbi94LXNob2Nrd2F2ZS1mbGFzaCcsXG4gIHRhcjogJ2FwcGxpY2F0aW9uL3gtdGFyJyxcbiAgdGlmOiAnaW1hZ2UvdGlmZicsXG4gIHRpZmY6ICdpbWFnZS90aWZmJyxcbiAgdHM6ICd2aWRlby9tcDJ0JyxcbiAgdHRmOiAnZm9udC90dGYnLFxuICB0eHQ6ICd0ZXh0L3BsYWluJyxcbiAgdnNkOiAnYXBwbGljYXRpb24vdm5kLnZpc2lvJyxcbiAgd2FzbTogJ2FwcGxpY2F0aW9uL3dhc20nLFxuICB3ZWJtOiAndmlkZW8vd2VibScsXG4gIHdlYmE6ICdhdWRpby93ZWJtJyxcbiAgd2VicDogJ2ltYWdlL3dlYnAnLFxuICB3b2ZmOiAnZm9udC93b2ZmJyxcbiAgd29mZjI6ICdmb250L3dvZmYyJyxcbiAgeGh0bWw6ICdhcHBsaWNhdGlvbi94aHRtbCt4bWwnLFxuICB4bHM6ICdhcHBsaWNhdGlvbi92bmQubXMtZXhjZWwnLFxuICB4bHN4OiAnYXBwbGljYXRpb24vdm5kLm9wZW54bWxmb3JtYXRzLW9mZmljZWRvY3VtZW50LnNwcmVhZHNoZWV0bWwuc2hlZXQnLFxuICB4bWw6ICdhcHBsaWNhdGlvbi94bWwnLFxuICB4dWw6ICdhcHBsaWNhdGlvbi92bmQubW96aWxsYS54dWwreG1sJyxcbiAgemlwOiAnYXBwbGljYXRpb24vemlwJyxcbiAgJzNncCc6ICd2aWRlby8zZ3BwJyxcbiAgJzNnMic6ICd2aWRlby8zZ3BwMicsXG4gICc3eic6ICdhcHBsaWNhdGlvbi94LTd6LWNvbXByZXNzZWQnLFxuICBnbHRmOiAnbW9kZWwvZ2x0Zitqc29uJyxcbiAgZ2xiOiAnbW9kZWwvZ2x0Zi1iaW5hcnknLFxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sTUFBTSxjQUFjLENBQUMsV0FBeUM7SUFDbkUsTUFBTSxTQUFTO0lBQ2YsTUFBTSxRQUFRLFNBQVMsS0FBSyxDQUFDO0lBQzdCLElBQUksQ0FBQyxPQUFPO0lBQ1osSUFBSSxXQUFXLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO0lBQzlCLElBQUksQUFBQyxZQUFZLFNBQVMsVUFBVSxDQUFDLFdBQVksYUFBYSxvQkFBb0I7UUFDaEYsWUFBWTtJQUNkLENBQUM7SUFDRCxPQUFPO0FBQ1QsRUFBQztBQUVELE1BQU0sUUFBZ0M7SUFDcEMsS0FBSztJQUNMLEtBQUs7SUFDTCxLQUFLO0lBQ0wsS0FBSztJQUNMLE1BQU07SUFDTixLQUFLO0lBQ0wsS0FBSztJQUNMLEtBQUs7SUFDTCxLQUFLO0lBQ0wsSUFBSTtJQUNKLEtBQUs7SUFDTCxLQUFLO0lBQ0wsS0FBSztJQUNMLEtBQUs7SUFDTCxLQUFLO0lBQ0wsTUFBTTtJQUNOLEtBQUs7SUFDTCxNQUFNO0lBQ04sS0FBSztJQUNMLElBQUk7SUFDSixLQUFLO0lBQ0wsTUFBTTtJQUNOLEtBQUs7SUFDTCxLQUFLO0lBQ0wsS0FBSztJQUNMLE1BQU07SUFDTixLQUFLO0lBQ0wsSUFBSTtJQUNKLE1BQU07SUFDTixRQUFRO0lBQ1IsS0FBSztJQUNMLEtBQUs7SUFDTCxNQUFNO0lBQ04sS0FBSztJQUNMLEtBQUs7SUFDTCxLQUFLO0lBQ0wsTUFBTTtJQUNOLE1BQU07SUFDTixLQUFLO0lBQ0wsS0FBSztJQUNMLEtBQUs7SUFDTCxLQUFLO0lBQ0wsS0FBSztJQUNMLEtBQUs7SUFDTCxNQUFNO0lBQ04sS0FBSztJQUNMLEtBQUs7SUFDTCxLQUFLO0lBQ0wsS0FBSztJQUNMLEtBQUs7SUFDTCxNQUFNO0lBQ04sS0FBSztJQUNMLElBQUk7SUFDSixLQUFLO0lBQ0wsS0FBSztJQUNMLEtBQUs7SUFDTCxLQUFLO0lBQ0wsTUFBTTtJQUNOLElBQUk7SUFDSixLQUFLO0lBQ0wsS0FBSztJQUNMLEtBQUs7SUFDTCxNQUFNO0lBQ04sTUFBTTtJQUNOLE1BQU07SUFDTixNQUFNO0lBQ04sTUFBTTtJQUNOLE9BQU87SUFDUCxPQUFPO0lBQ1AsS0FBSztJQUNMLE1BQU07SUFDTixLQUFLO0lBQ0wsS0FBSztJQUNMLEtBQUs7SUFDTCxPQUFPO0lBQ1AsT0FBTztJQUNQLE1BQU07SUFDTixNQUFNO0lBQ04sS0FBSztBQUNQIn0=