import { stream } from '@netlify/functions';
import convertHtml from 'wget-k';

function createProxyUrl(url: string, base: string, proxyUrl: string) {
    return new URL(proxyUrl).toString() + new URL(url, base).toString();
}

function getAbsHtml(html: string, url: string, proxyUrl: string) {
    console.log('url: ', url, '\tproxyUrl: ', proxyUrl);

    return convertHtml(html, url);
}

// similar to `wget -k`
async function fetchk(url: string, proxyUrl: string) {
    const res = await fetch(url);
    const headers = res.headers;
    console.log('headers: ', headers);

    const contentType = headers.get('content-type');
    console.log('contentType: ', contentType);

    if (!contentType?.includes('text/html')) {
        return res.text();
    } else {
        const html = await res.text();
        return getAbsHtml(html, url, proxyUrl);
    }
}

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
    const reqUrl = event.rawUrl;
    const reqPath = event.path;
    let toUrl: URL, baseUrl: URL;
    let response: string;

    // parsing url
    try {
        const toUrlStr = getUrl(reqPath);
        const preUrl = reqUrl.slice(0, reqUrl.length - toUrlStr.length);

        toUrl = new URL(toUrlStr);
        baseUrl = new URL(preUrl);
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
        response = await fetchk(toUrl.toString(), baseUrl.toString());
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
        body: new ReadableStream({
            start(controller) {
                controller.enqueue(new TextEncoder().encode(response));
                controller.close();
            }
        })
    };
});

export { handler };
