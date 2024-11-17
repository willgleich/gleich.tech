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
        default:
            var render_data = {}
            break
        case "blog_home":
            var blog_data = await blog.get_blog_data();
            var render_data = {"data":blog_data.reverse()}
            break
        case "blog_post":
            var blog_data = await blog.get_blog_data();
            for (const blog_d of blog_data) {
                var render_data = {"data":blog_d}
                try {
                    //create output directory
                    await mkdir("dist/blog", { recursive: true });

                    //render ejs template to html string
                    //pass pageModel in to render content
                    const html = await ejs
                        .renderFile(filename, render_data)
                        .then((output) => output);
                    //create file and write html
                    out_file = blog_d.slug
                    if (file_name === "index") {
                        var output_file = "dist/blog/" + out_file + ".html"
                    }
                    else {
                        var output_file = "dist/blog/" + out_file
                    }
                    console.log(filename)
                    await writeFile(output_file, html);
                } catch (error) {
                    console.log("test")
                    console.log(error);
                }
            }
    }
    // file_name = file_path.
    try {
        //create output directory
        await mkdir("dist", { recursive: true });

        //render ejs template to html string
        //pass pageModel in to render content
        const html = await ejs
            .renderFile(filename, render_data)
            .then((output) => output);
        //create file and write html
        if (file_name === "index") {
            var output_file = "dist/" + file_name + ".html"
        }
        else {
            var output_file = "dist/" + file_name
        }
        console.log(filename)
        await writeFile(output_file, html);
    } catch (error) {
        console.log("test")
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



// const filenames = ["views/index.ejs", "views/aboutme.ejs", "views/resume.ejs"]


Promise.all(filenames.map(render)).then(() => { console.log('all done!'); })
// for (let item of filenames) {
//     render(item).then(() => {
//        console.log("Successfully rendered " + item)
//     });
// }

