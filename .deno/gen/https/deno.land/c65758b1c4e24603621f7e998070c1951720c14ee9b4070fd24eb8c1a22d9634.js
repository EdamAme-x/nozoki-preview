export const prettyJSON = (options = {
    space: 2
})=>{
    return async (c, next)=>{
        const pretty = c.req.query('pretty') || c.req.query('pretty') === '' ? true : false;
        await next();
        if (pretty && c.res.headers.get('Content-Type')?.startsWith('application/json')) {
            const obj = await c.res.json();
            c.res = new Response(JSON.stringify(obj, null, options.space), c.res);
        }
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaG9ub0B2My4xMC4wL21pZGRsZXdhcmUvcHJldHR5LWpzb24vaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBNaWRkbGV3YXJlSGFuZGxlciB9IGZyb20gJy4uLy4uL3R5cGVzLnRzJ1xuXG50eXBlIHByZXR0eU9wdGlvbnMgPSB7XG4gIHNwYWNlOiBudW1iZXJcbn1cblxuZXhwb3J0IGNvbnN0IHByZXR0eUpTT04gPSAob3B0aW9uczogcHJldHR5T3B0aW9ucyA9IHsgc3BhY2U6IDIgfSk6IE1pZGRsZXdhcmVIYW5kbGVyID0+IHtcbiAgcmV0dXJuIGFzeW5jIChjLCBuZXh0KSA9PiB7XG4gICAgY29uc3QgcHJldHR5ID0gYy5yZXEucXVlcnkoJ3ByZXR0eScpIHx8IGMucmVxLnF1ZXJ5KCdwcmV0dHknKSA9PT0gJycgPyB0cnVlIDogZmFsc2VcbiAgICBhd2FpdCBuZXh0KClcbiAgICBpZiAocHJldHR5ICYmIGMucmVzLmhlYWRlcnMuZ2V0KCdDb250ZW50LVR5cGUnKT8uc3RhcnRzV2l0aCgnYXBwbGljYXRpb24vanNvbicpKSB7XG4gICAgICBjb25zdCBvYmogPSBhd2FpdCBjLnJlcy5qc29uKClcbiAgICAgIGMucmVzID0gbmV3IFJlc3BvbnNlKEpTT04uc3RyaW5naWZ5KG9iaiwgbnVsbCwgb3B0aW9ucy5zcGFjZSksIGMucmVzKVxuICAgIH1cbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU1BLE9BQU8sTUFBTSxhQUFhLENBQUMsVUFBeUI7SUFBRSxPQUFPO0FBQUUsQ0FBQyxHQUF3QjtJQUN0RixPQUFPLE9BQU8sR0FBRyxPQUFTO1FBQ3hCLE1BQU0sU0FBUyxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsYUFBYSxFQUFFLEdBQUcsQ0FBQyxLQUFLLENBQUMsY0FBYyxLQUFLLElBQUksR0FBRyxLQUFLO1FBQ25GLE1BQU07UUFDTixJQUFJLFVBQVUsRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsV0FBVyxxQkFBcUI7WUFDL0UsTUFBTSxNQUFNLE1BQU0sRUFBRSxHQUFHLENBQUMsSUFBSTtZQUM1QixFQUFFLEdBQUcsR0FBRyxJQUFJLFNBQVMsS0FBSyxTQUFTLENBQUMsS0FBSyxJQUFJLEVBQUUsUUFBUSxLQUFLLEdBQUcsRUFBRSxHQUFHO1FBQ3RFLENBQUM7SUFDSDtBQUNGLEVBQUMifQ==