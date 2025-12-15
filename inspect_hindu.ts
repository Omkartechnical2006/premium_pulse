import * as cheerio from "cheerio";

async function run() {
    try {
        const res = await fetch("https://www.thehindu.com/premium/");
        const html = await res.text();
        const $ = cheerio.load(html);
        const scripts = $('script[type="application/ld+json"]');
        scripts.each((i, el) => {
            console.log(`--- JSON-LD ${i} ---`);
            console.log($(el).html());
        });
    } catch (e) {
        console.error(e);
    }
}

run();
