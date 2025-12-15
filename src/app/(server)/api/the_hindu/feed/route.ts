import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const urlParam = searchParams.get("url");
    const source = searchParams.get("source") || "rss"; // 'rss' | 'latest'

    if (!urlParam && source === 'latest') {
        return NextResponse.json({
            success: false,
            error: "Missing url parameter for scraping",
        });
    }

    // SCAPING LOGIC (Latest)
    if (source === "latest") {
        try {
            const html_res = await fetch(urlParam!);
            if (!html_res.ok) {
                return NextResponse.json({
                    success: false,
                    error: "Failed to fetch feed",
                });
            }
            const htmlText = await html_res.text();
            const $ = cheerio.load(htmlText);

            // Selectors from original scraping implementation
            const articleElements = $(".element");

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let items: any[] = [];

            if (articleElements.length) {
                items = articleElements.map((_, el) => {
                    const $el = $(el);
                    const titleLink = $el.find("h3.title a");
                    const title = titleLink.text().trim();
                    const href = titleLink.attr("href")?.trim() || "";
                    const idMatch = href.match(/article(\d+)\.ece/);
                    const id = idMatch ? idMatch[1] : href;
                    const imgEl = $el.find("img").first();
                    let img = imgEl.attr("data-src-template")?.trim() ||
                        imgEl.attr("data-original")?.trim() ||
                        imgEl.attr("src")?.trim() || "";
                    if (img && !img.startsWith("http")) img = "";
                    if (img.includes("1x1_spacer.png")) img = "";
                    const author = $el.find(".author-name").text().trim();
                    let para = "";
                    if (imgEl.length) {
                        para = imgEl.attr("title")?.trim() || imgEl.attr("alt")?.trim() || "";
                    }
                    if (para === "Image used for representational purposes." || para === "For representative purposes.") {
                        para = "";
                    }
                    const date = ""; // Scraping doesn't get date
                    if (!title) return null;
                    return { id, title, date, para, author, img, wu: href };
                }).get().filter(Boolean);
            }
            return NextResponse.json({ success: true, data: items });

        } catch (err) {
            console.log("Error scraping feed:", err);
            return NextResponse.json({ success: false, error: "Failed to scrape" });
        }
    }

    // RSS LOGIC (Default)
    // RSS doesn't support pagination, so we only return for page 1 logic (implicitly handled by caller resetting page)
    // or we just return empty if page > 1 looks like it was requested via URL, but here we just ignore url param for RSS
    // except to check pagination if we wanted strictly.
    // The previous RSS implementation added a check for ?page= but let's keep it simple or strictly follow previous logic.
    if (urlParam?.includes("?page=") && !urlParam.includes("?page=1")) {
        return NextResponse.json({ success: true, data: [] });
    }

    const rssUrl = "https://www.thehindu.com/premium/feeder/default.rss";

    try {
        const rss_res = await fetch(rssUrl);
        if (!rss_res.ok) {
            return NextResponse.json({
                success: false,
                error: "Failed to fetch RSS feed",
            });
        }
        const xmlText = await rss_res.text();
        const $ = cheerio.load(xmlText, { xmlMode: true });

        const items = $("item").map((_, el) => {
            const $el = $(el);
            const title = $el.find("title").text().replace("<![CDATA[", "").replace("]]>", "").trim();
            const link = $el.find("link").text().replace("<![CDATA[", "").replace("]]>", "").trim();
            const description = $el.find("description").text().replace("<![CDATA[", "").replace("]]>", "").trim();
            const pubDate = $el.find("pubDate").text().replace("<![CDATA[", "").replace("]]>", "").trim();
            const mediaContent = $el.find("media\\:content, content");
            const img = mediaContent.attr("url") || "";
            const idMatch = link.match(/article(\d+)\.ece/);
            const id = idMatch ? idMatch[1] : link;
            let formattedDate = pubDate;
            try {
                if (pubDate) {
                    const d = new Date(pubDate);
                    formattedDate = d.toLocaleDateString("en-US", {
                        year: "numeric", month: "short", day: "numeric",
                    });
                }
            } catch (e) { console.error("Date parsing error", e); }

            return {
                id,
                title,
                date: formattedDate,
                para: description,
                author: "",
                img,
                wu: link,
            };
        }).get();

        return NextResponse.json({ success: true, data: items });
    } catch (err) {
        console.log("Error fetching RSS:", err);
        return NextResponse.json({
            success: false,
            error: "Failed to fetch: Internal Server Error",
        });
    }
}
