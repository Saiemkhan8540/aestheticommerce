require('dotenv').config(); 
const express = require('express');
const { SitemapStream, streamToPromise } = require('sitemap');
const { MongoClient } = require('mongodb');
const router = express.Router();

// MongoDB connection URL
const uri = process.env.DB_CONNECT; 
const database=process.env.DB_NAME;
const client = new MongoClient(uri);

router.get('/sitemap.xml', async (req, res) => {
  try {
    await client.connect();
    const db = client.db(database);

    // Fetch categories and products
    const categories = await db.collection('categories').find({}).toArray();
    const products = await db.collection('products').find({}).toArray();

    // Create sitemap stream
    const sitemap = new SitemapStream({ hostname: 'https://aestheticommerce.com' });

    // Homepage
    sitemap.write({ url: '/', priority: 1.0, changefreq: 'weekly' });

    // Categories
    categories.forEach(cat => {
      if (cat.slug) {
        sitemap.write({ url: `/${cat.slug}`, priority: 0.8, changefreq: 'weekly' });
      }
    });

    // Products
    products.forEach(prod => {
      if (prod.slug) {
        sitemap.write({ url: `/${prod.slug}`, priority: 0.7, changefreq: 'weekly' });
      }
    });

    sitemap.end();

    // Convert stream to XML and send to browser
    const xml = await streamToPromise(sitemap);
    res.header('Content-Type', 'application/xml');
    res.send(xml.toString());
  } catch (err) {
    console.error('Error generating sitemap:', err);
    res.status(500).end();
  } finally {
    await client.close();
  }
});

module.exports = router;