"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import StorySkeleton from "@/components/story_skeleton";

// Define StoryData locally since it's simple or import if shared properly. 
// Reusing structure from IE implementation.
interface StoryData {
    headline: string;
    description: string;
    articleBody: string;
    datePublished: string;
    author: { name: string } | undefined;
    image: { url: string } | undefined;
}

export default function StoryPage() {
    const pathname = usePathname();
    const router = useRouter();
    const [story_data, setStoryData] = useState<StoryData | null>(null);
    const [error_msg, setErrorMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Extract ID from pathname: /the_hindu_premium/story/[id]
        // ID format for The Hindu: article12345678.ece or just the number depending on how I stored it.
        // In feed route I stored full match e.g. "12345678"
        const id = pathname?.split("/").pop();

        const fetchData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                // I need a new API route to fetch the story content!
                // /api/the_hindu/fetch-story?id=...
                // Construct the full URL to scrape based on ID if possible, or pass pure ID if mapped.
                // The Hindu articles are typically https://www.thehindu.com/anything/article{id}.ece
                // But finding the exact URL section might be tricky without it.
                // HOWEVER, in the feed I have the full 'wu' (web url). 
                // But here I only have ID in the URL...
                // Wait, if I click from feed, I can pass the URL? No, standard navigation limits state passing unless context used.
                // Strategy: 
                // Option A: Pass full URL in query param: /the_hindu_premium/story?url=... (Easier)
                // Option B: Use ID and try to find it? (Hard because section path varies).

                // Let's check how IE does it. IE feeds return ID, and IE story page uses ID. 
                // `api_endpoints.ie.fetch_story` is `https://indianexpress.com/wp-json/wp/v2/article`. 
                // IE uses WordPress API where ID is sufficient!

                // TOI uses `toi_plus/story/...` but it extracts from URL.
                // TOI feed item `wu` has the path. 
                // TOI page: `href={'/toi_plus/story${item.wu?.match(/toi-plus(\/.+)$/)?.[1] ?? ""}'}`
                // It replays the path structure!

                // The Hindu structure: `https://www.thehindu.com/section/subsection/title/article12345678.ece`
                // My feed `id` is `12345678`.
                // If I route to `/the_hindu_premium/story/12345678`, I lose the section info needed to reconstruct the URL *unless* I can query via ID.
                // THE HINDU DOES NOT HAVE A PUBLIC API like WP.

                // BETTER APPROACH:
                // Pass the full URL (double encoded) or just the path suffix if constant.
                // The path varies wildly.
                // Easiest is to change `page.tsx` (feed) to link to `/the_hindu_premium/story?url=...`
                // OR rely on a search/lookup.

                // Let's modify the Feed to pass `url` as a query param or encode it in the path.
                // Path encoding is cleaner: `/the_hindu_premium/story/[...slug]` where slug is the path.
                // `https://www.thehindu.com/news/national/article.ece` -> `/the_hindu_premium/story/news/national/article.ece`

                // BUT, The Hindu URL: `https://www.thehindu.com/section/articleID.ece`
                // I can just strip `https://www.thehindu.com/` and use the rest as slug.

                // So, let's assume I switch to `[...slug]` approach.
                // Re-construct URL: `https://www.thehindu.com/${slug.join("/")}`

                // Fetching content:
                // I need an API route validation that takes this URL and scrapes it.
                // I will create `/api/the_hindu/fetch-story`

                // TEMP FIX for this file: assume slug based routing.
                // I need to update the FEED page to generate this link.

                // Let's look at `pathname`.
                // If I use `[...slug]`, pathname will be `/the_hindu_premium/story/news/national/article...`
                // So I can just slice off `/the_hindu_premium/story/`.

                const relativePath = pathname?.replace("/the_hindu_premium/story/", "");
                if (!relativePath) return;

                const targetUrl = `https://www.thehindu.com/${relativePath}`;

                const res = await fetch(`/api/the_hindu/fetch-story?url=${encodeURIComponent(targetUrl)}`);

                if (!res.ok) {
                    setErrorMsg(`Fetch error: ${res.status}`);
                    return;
                }

                const data = await res.json();
                if (!data.success) {
                    setErrorMsg(data.error || "Failed to load story");
                    return;
                }

                setStoryData(data.data);

            } catch (err) {
                console.error(err);
                setErrorMsg("An unexpected error occurred.");
            } finally {
                setLoading(false);
            }
        };

        if (pathname) fetchData();
    }, [pathname]);

    return (
        <article>
            <div className="max-w-4xl mx-auto p-4">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="mb-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                >
                    ← Go Back
                </button>

                {error_msg ? (
                    <div className="text-red-600 text-center mt-8">{error_msg}</div>
                ) : loading || !story_data ? (
                    <StorySkeleton />
                ) : (
                    <>
                        <h1 className="text-3xl font-bold mb-4">{story_data.headline}</h1>

                        {story_data.image?.url && (
                            <Image
                                src={story_data.image.url}
                                alt={story_data.headline}
                                className="w-full h-auto mb-6 rounded"
                                width={600}
                                height={400}
                                unoptimized={true}
                                priority={true}
                            />
                        )}

                        <p className="text-lg">
                            {story_data.author?.name
                                ? `By ${story_data.author.name}`
                                : "By Unknown Author"}
                        </p>
                        <p className="text-sm text-gray-500 mb-6">
                            {story_data.datePublished
                                ? new Date(story_data.datePublished).toLocaleString("en-IN", {
                                    timeZone: "Asia/Kolkata",
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                }) + " IST"
                                : ""}
                        </p>
                        <p className="text-gray-700 mb-6 italic">
                            {story_data.description || ""}
                        </p>
                        <div>
                            {story_data.articleBody ? (
                                <div
                                    className="prose prose-lg max-w-none"
                                    dangerouslySetInnerHTML={{ __html: story_data.articleBody }}
                                />
                            ) : (
                                <p className="text-gray-500 text-base mt-4">
                                    Read the full story on <a href={`https://www.thehindu.com/${pathname?.replace("/the_hindu_premium/story/", "")}`} target="_blank" className="text-blue-600 underline">The Hindu</a>
                                </p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </article>
    );
}
