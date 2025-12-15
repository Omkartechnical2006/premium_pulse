import * as cheerio from "cheerio";

async function run() {
    console.log("Starting fetch...");
    try {
        const res = await fetch("https://www.thehindu.com/premium/");
        console.log("Status:", res.status);
        const html = await res.text();
        console.log("HTML length:", html.length);

        if (html.includes("application/ld+json")) {
            console.log("Text 'application/ld+json' FOUND in HTML!");
        } else {
            console.log("Text 'application/ld+json' NOT found in HTML.");
        }

        if (html.includes("schema.org")) {
            console.log("Text 'schema.org' FOUND in HTML!");
        }

        if (html.includes("__NEXT_DATA__")) {
            console.log("Text '__NEXT_DATA__' FOUND in HTML! This is a Next.js site.");
        } else {
            console.log("Text '__NEXT_DATA__' NOT found.");
        }

        // Check for other common data objects
        const $ = cheerio.load(html); // Load cheerio here if not already loaded
        const scriptContent = $("script").map((i, el) => $(el).html()).get().join(" ");
        if (scriptContent.includes("window.__PRELOADED_STATE__")) console.log("Found __PRELOADED_STATE__");
        if (scriptContent.includes("window.initialState")) console.log("Found initialState");


        // Check for Microdata
        const itemProps = $("[itemprop]");
        console.log("Found elements with itemprop:", itemProps.length);
        itemProps.slice(0, 5).each((i, el) => {
            console.log(`--- Microdata ${i} ---`);
            console.log("Tag:", el.tagName);
            console.log("Itemprop:", $(el).attr("itemprop"));
            console.log("Content:", $(el).text().trim().substring(0, 50));
        });

        const scripts = $('script[type="application/ld+json"]');
        console.log("Found scripts via cheerio:", scripts.length);
        scripts.each((i, el) => {
            console.log(`--- JSON-LD ${i} ---`);
            console.log($(el).html());
        });
    } catch (e) {
        console.error("Error:", e);
    }
}

run();
