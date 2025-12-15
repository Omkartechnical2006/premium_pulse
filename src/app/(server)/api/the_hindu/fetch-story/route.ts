import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const urlParam = searchParams.get("url");

    if (!urlParam) {
        return NextResponse.json({
            success: false,
            error: "Missing url parameter",
        });
    }

    try {
        const res = await fetch(urlParam);
        if (!res.ok) {
            return NextResponse.json({
                success: false,
                error: "Failed to fetch story",
            });
        }

        const htmlText = await res.text();
        const $ = cheerio.load(htmlText);

        // Selectors for The Hindu Story Page
        // Headline: h1.title or .article-title
        const headline = $("h1.title").first().text().trim() || $("h1.article-title").first().text().trim();

        // Description: h2.intro or meta[name="description"]
        const description = $("h2.intro").first().text().trim() ||
            $('meta[name="description"]').attr("content") || "";

        // Author: .author-name
        const authorName = $(".author-name").first().text().trim() ||
            $(".auth-nm").first().text().trim();

        // Date: .publish-time, .publish-time-new or meta[property="article:published_time"]
        const datePublished = $('meta[property="article:published_time"]').attr("content") ||
            $(".publish-time").first().text().trim() ||
            $(".publish-time-new").first().text().trim();

        // Image: .lead-img img or meta[property="og:image"]
        const imageUrl = $('meta[property="og:image"]').attr("content") ||
            $(".lead-img img").first().attr("src");

        // Body: Prefer [itemprop="articleBody"]
        let articleBody = "";
        const schemaDiv = $("[itemprop='articleBody']");

        if (schemaDiv.length) {
            // Get paragraphs to avoid scripts/ads
            articleBody = schemaDiv.find("p").map((_, el) => `<p>${$(el).html()}</p>`).get().join("");
        } else {
            // Fallback to .articlebodycontent
            const contentDiv = $(".articlebodycontent");
            if (contentDiv.length) {
                // Try to get just ps
                const paras = contentDiv.find("p");
                if (paras.length) {
                    articleBody = paras.map((_, el) => `<p>${$(el).html()}</p>`).get().join("");
                } else {
                    articleBody = contentDiv.html() || "";
                }
            } else {
                // Final fallback
                const bodyDiv = $("div[id^='content-body-']");
                if (bodyDiv.length) {
                    articleBody = bodyDiv.find("p").map((_, el) => `<p>${$(el).html()}</p>`).get().join("") || bodyDiv.html() || "";
                }
            }
        }

        const data = {
            headline,
            description,
            articleBody,
            datePublished,
            author: authorName ? { name: authorName } : undefined,
            image: imageUrl ? { url: imageUrl } : undefined
        };

        return NextResponse.json({ success: true, data });

    } catch (err) {
        console.log("Error fetching story:", err);
        return NextResponse.json({
            success: false,
            error: "Failed to fetch story content",
        });
    }
}
