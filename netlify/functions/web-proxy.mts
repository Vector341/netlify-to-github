import { stream } from '@netlify/functions';
/**
 * get the dest url embedded in a string
 * @param str looks like `/web-proxy/https://example.com/`
 */
function getUrl(str: string) {
    // Regex to match URLs - captures protocol, domain, path, query params, and hash
    const urlRegex = /https?:\/\/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
    const match = str.match(urlRegex);

    if (!match) {
        throw new TypeError('No valid URL found in given string: ' + str);
    }

    return match[0];
}

const handler = stream(async (event) => {
    // const reqUrl = event.queryStringParameters;
    const reqPath = event.path;
    let toUrl: URL;
    let response: Response;

    // parsing url
    try {
        const toUrlStr = getUrl(reqPath);
        toUrl = new URL(toUrlStr);
    } catch (e) {
        if (e instanceof TypeError) {
            console.error('not a valid url');
            return {
                statusCode: 400,
                body: new ReadableStream({
                    start(controller) {
                        controller.enqueue(new TextEncoder().encode('Invalid proxy url.\n' + e));
                        controller.close();
                    }
                })
            };
        }
        return {
            statusCode: 400,
            body: new ReadableStream({
                start(controller) {
                    controller.enqueue(new TextEncoder().encode('construct to url failed'));
                    controller.close();
                }
            })
        };
    }
    console.log('parsed to url: ', toUrl);

    // fetch resource
    try {
        response = await fetch(toUrl);
    } catch (e) {
        console.error(e);
        return {
            statusCode: 500,
            body: new ReadableStream({
                start(controller) {
                    controller.enqueue(new TextEncoder().encode('Fetch toUrl failed' + e));
                    controller.close();
                }
            })
        };
    }

    // convert link

    return {
        statusCode: 200,
        body: response.body
    };
});

export { handler };
