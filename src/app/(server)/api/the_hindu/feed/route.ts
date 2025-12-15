import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const urlParam = searchParams.get("url");

    // Enforce URL parameter presence for scraping
    if (!urlParam) {
        return NextResponse.json({
            success: false,
            error: "Missing url parameter for scraping",
        });
    }

    // SCRAPING LOGIC (Always active now)
    try {
        const html_res = await fetch(urlParam);
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
