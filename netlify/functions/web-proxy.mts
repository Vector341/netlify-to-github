import { stream, Handler, HandlerEvent } from '@netlify/functions';

const handler = stream(async (event) => {
    const reqUrl = event.queryStringParameters;
    const toUrlStr = reqUrl.to;
    let toUrl: URL;
    let response: Response;

    // ... existing code ...
    try {
        toUrl = new URL(toUrlStr);
    } catch (e) {
        if (e instanceof TypeError) {
            console.error('not valid url');
            return {
                statusCode: 400,
                body: new ReadableStream({
                    start(controller) {
                        controller.enqueue(new TextEncoder().encode('Invalid proxy url.' + e));
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

    try {
        response = await fetch(toUrl);
    } catch (e) {
        console.error(e);
        return {
            statusCode: 500,
            body: new ReadableStream({
                start(controller) {
                    controller.enqueue(new TextEncoder().encode('Fetch tourl failed' + e));
                    controller.close();
                }
            })
        };
    }

    return {
        statusCode: 200,
        body: response.body
    };
});

export { handler };
