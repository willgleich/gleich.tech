const util = require("util");
const fs = require("fs")
const ejs = require("ejs")
const path = require('path');
const blog = require("./blog.js");


const mkdir = util.promisify(fs.mkdir);
// const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);


async function render(filename) {
    let file_name = path.posix.basename(filename, ".ejs")

    switch (file_name) {
        case "base":
            return;
        case "blog":
            // Legacy blog page - rename to blog-old to avoid conflict with blog directory
            var blog_data = await blog.get_blog_data();
            var render_data = {"data":blog_data.reverse()}
            var output_file = "dist/blog-old"
            break;
        case "blog_home":
            // New blog home page with card grid - this becomes the main /blog page
            var posts = await blog.get_blog_data();
            var render_data = {"posts": posts.reverse()}
            var output_file = "dist/blog.html"
            break;
        case "blog_post":
            // Skip blog_post template - will render individual posts separately
            return;
        default:
            var render_data = {}
            // Determine output file
            if (file_name === "index") {
                var output_file = "dist/" + file_name + ".html"
            } else {
                var output_file = "dist/" + file_name
            }
    }

    try {
        //create output directory
        await mkdir("dist", { recursive: true });

        //render ejs template to html string
        //pass pageModel in to render content
        const html = await ejs
            .renderFile(filename, render_data)
            .then((output) => output);

        //create file and write html
        // Use output_file if already set in switch, otherwise use default logic
        if (!output_file) {
            if (file_name === "index") {
                output_file = "dist/" + file_name + ".html"
            } else {
                output_file = "dist/" + file_name
            }
        }
        console.log("Rendered: " + filename + " -> " + output_file)
        await writeFile(output_file, html);
    } catch (error) {
        console.log("Error rendering " + filename)
        console.log(error);
    }
}

// Function to render individual blog posts
async function renderBlogPosts() {
    try {
        const posts = await blog.get_blog_data();
        const allTags = blog.get_all_tags();

        // Create blog directory for individual posts
        await mkdir("dist/blog", { recursive: true });

        for (let i = 0; i < posts.length; i++) {
            const post = posts[i];

            // Get recent posts (excluding current post)
            const recentPosts = posts.slice().reverse().slice(0, 5).filter(p => p.slug !== post.slug);

            // Get previous/next posts
            const adjacentPosts = blog.get_adjacent_posts(post.slug);

            // Render the blog post
            const html = await ejs.renderFile('views/blog_post.ejs', {
                post: post,
                recentPosts: recentPosts,
                previousPost: adjacentPosts.previous,
                nextPost: adjacentPosts.next,
                allTags: allTags
            });

            // Write to dist/blog/[slug] (no .html extension for clean URLs)
            const output_file = "dist/blog/" + post.slug;
            await writeFile(output_file, html);
            console.log("Rendered blog post: " + post.slug + " -> " + output_file);
        }

        console.log("All blog posts rendered successfully!");
    } catch (error) {
        console.log("Error rendering blog posts:");
        console.log(error);
    }
}

// function render(filename) {
//     console.log(filename)
//     file_name = path.posix.basename(filename, ".ejs")
//     // file_name = file_path.
//     try {
//         //create output directory
//         mkdir("dist", { recursive: true });
//
//         //render ejs template to html string
//         //pass pageModel in to render content
//         const html =  ejs
//             .renderFile(filename, {})
//             .then((output) => output);
//         //create file and write html
//         output_file = "dist/" + file_name + ".html"
//         fs.writeFile(output_file, html, (err) => {
//             if (err)
//                 console.log(err);
//             else {
//                 console.log("File written successfully\n");
//                 console.log("The written has the following contents:");
//                 console.log(fs.readFileSync("books.txt", "utf8"));
//             }
//     })
//     } catch (error) {
//         console.log("test")
//         console.log(error);
//     }
// }

const filenames = []
fs.readdirSync("views").forEach(file => {
    filenames.push("views/"+file)
});

// Render all templates, then render individual blog posts
Promise.all(filenames.map(render))
    .then(() => {
        console.log('All templates rendered!');
        return renderBlogPosts();
    })
    .then(() => {
        console.log('Static site generation complete!');
    })
    .catch((error) => {
        console.log('Error during static site generation:');
        console.log(error);
    });
// for (let item of filenames) {
//     render(item).then(() => {
//        console.log("Successfully rendered " + item)
//     });
// }

