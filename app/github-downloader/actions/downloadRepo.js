'use server';

import { getStore, set } from '@netlify/blobs';
import { Octokit } from '@octokit/rest';

function store() {
    return getStore({ name: 'git-archives', consistency: 'strong' });
}

export async function downloadRepo(owner, repo, ref = 'main') {
    const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN && ''
    });

    try {
        // Step 1: Fetch the endpoint
        const response = await octokit.rest.repos.downloadZipballArchive({
            owner,
            repo,
            ref
        });

        const arrayBuffer = response.data;
        const buffer = Buffer.from(arrayBuffer);

        // Step 3: Generate a link under the Vercel scope for the file
        const filename = `${owner}-${repo}-${ref}.zip`;
        const blob = new Blob([buffer], { type: 'application/zip' });

        console.log('before set', filename, blob.size);
        await store().set(filename, blob);
        const retrive = await store().get(filename);
        console.log('after set', retrive.size);

        // Step 4: Return the Vercel Blob URL for downloading
        return { success: true, downloadUrl: blob.url };
    } catch (error) {
        console.error('Error downloading repository:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Failed to download repository' };
    }
}
