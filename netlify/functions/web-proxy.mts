export default async (req: Request) => {
    const reqUrl = new URL(req.url);
    const toUrlStr = reqUrl.searchParams.get('to');
    let toUrl: URL;
    let response: Response;

    try {
        toUrl = new URL(toUrlStr);
    } catch (e) {
        if (e instanceof TypeError) {
            console.error('not valid url');
            return new Response('Invalid proxy url.' + e);
        }
        return new Response('construct to url failed');
    }
    try {
        response = await fetch(toUrl);
    } catch (e) {
        console.error(e);
        return new Response('Fetch tourl failed' + e);
    }

    return response;
};
