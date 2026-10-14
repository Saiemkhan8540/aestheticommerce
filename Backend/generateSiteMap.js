require('dotenv').config();
const fs = require('fs');
const { SitemapStream, streamToPromise } = require('sitemap');
const { MongoClient } = require('mongodb');

// MongoDB connection (set DB_CONNECT in Backend/.env)
const uri = process.env.DB_CONNECT;
const client = new MongoClient(uri);

async function generateSitemap() {
    try {
        await client.connect();
        const db = client.db('InternshipDb');

        // Collections
        const products = await db.collection('products').find({}).toArray();
        const categories = await db.collection('categories').find({}).toArray();

        // Create sitemap stream
        const sitemap = new SitemapStream({ hostname: 'https://aestheticommerce.com' });

        // Add homepage
        sitemap.write({ url: '/', changefreq: 'weekly', priority: 1.0 });

        // Add categories
        categories.forEach(cat => {
            sitemap.write({ url: `/${cat.slug}`, changefreq: 'weekly', priority: 0.8 });
        });

        // // Add products
        // products.forEach(prod => {
        //     sitemap.write({ url: `/${prod.slug}`, changefreq: 'weekly', priority: 0.7 });
        // });

        sitemap.end();

        // Convert stream to XML and save
        const xml = await streamToPromise(sitemap);
        fs.writeFileSync('sitemap.xml', xml.toString());
        console.log('Sitemap generated successfully!');
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

generateSitemap();