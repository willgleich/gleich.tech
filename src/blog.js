const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const stat = promisify(fs.stat);

// Blog post metadata configuration
// TODO: Consider moving this to a separate JSON file or adding YAML front matter to markdown files
const BLOG_POSTS = [
    {
        slug: "homelab-antics-part-1",
        title: "Homelab Antics Part 1",
        filename: "blog1.md",
        date: "09-05-2020",
        excerpt: "Setting up and configuring my homelab infrastructure with pfSense and virtualization.",
        tags: ["homelab", "networking", "virtualization"],
        icon: "fas fa-server",
        // thumbnail: "/images/blog/homelab-thumb.jpg",  // TODO: Add thumbnail image
        // heroImage: "/images/blog/homelab-hero.jpg"     // TODO: Add hero image
    },
    {
        slug: "cloud-failover",
        title: "Cloud Failover",
        filename: "blog2.md",
        date: "10-14-2020",
        excerpt: "Implementing automated failover strategies for cloud infrastructure.",
        tags: ["cloud", "devops", "infrastructure"],
        icon: "fas fa-cloud",
        // thumbnail: "/images/blog/cloud-failover-thumb.jpg",  // TODO: Add thumbnail image
        // heroImage: "/images/blog/cloud-failover-hero.jpg"     // TODO: Add hero image
    }
];

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}

async function get_file_data(filename) {
    const contents = await readFile(path.join(__dirname, './public/blog_docs/' + filename),'utf8');
    const showdown = require('showdown'),
        converter = new showdown.Converter(),
        html = await converter.makeHtml(contents);
    const file_stat = await stat(path.join(__dirname, './public/blog_docs/' + filename),'utf8');
    return {
        body: html,
        date: formatDate(file_stat.mtime)
    };
}

// Get all blog posts with full data
async function get_blog_data() {
    const posts = [];

    for (const postMeta of BLOG_POSTS) {
        const fileData = await get_file_data(postMeta.filename);
        posts.push({
            slug: postMeta.slug,
            title: postMeta.title,
            body: fileData.body,
            date: postMeta.date,
            excerpt: postMeta.excerpt,
            tags: postMeta.tags,
            icon: postMeta.icon,
            thumbnail: postMeta.thumbnail,
            heroImage: postMeta.heroImage
        });
    }

    return posts;
}

// Get a single blog post by slug
async function get_blog_post_by_slug(slug) {
    const postMeta = BLOG_POSTS.find(post => post.slug === slug);

    if (!postMeta) {
        return null;
    }

    const fileData = await get_file_data(postMeta.filename);

    return {
        slug: postMeta.slug,
        title: postMeta.title,
        body: fileData.body,
        date: postMeta.date,
        excerpt: postMeta.excerpt,
        tags: postMeta.tags,
        icon: postMeta.icon,
        thumbnail: postMeta.thumbnail,
        heroImage: postMeta.heroImage
    };
}

// Get all unique tags from blog posts
function get_all_tags() {
    const tags = new Set();
    BLOG_POSTS.forEach(post => {
        if (post.tags) {
            post.tags.forEach(tag => tags.add(tag));
        }
    });
    return Array.from(tags);
}

// Get previous and next posts for navigation
function get_adjacent_posts(currentSlug) {
    const currentIndex = BLOG_POSTS.findIndex(post => post.slug === currentSlug);

    if (currentIndex === -1) {
        return { previous: null, next: null };
    }

    return {
        previous: currentIndex > 0 ? BLOG_POSTS[currentIndex - 1] : null,
        next: currentIndex < BLOG_POSTS.length - 1 ? BLOG_POSTS[currentIndex + 1] : null
    };
}

exports.get_blog_data = get_blog_data;
exports.get_blog_post_by_slug = get_blog_post_by_slug;
exports.get_all_tags = get_all_tags;
exports.get_adjacent_posts = get_adjacent_posts;