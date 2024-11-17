// import path from "path";
// import showdown from "showdown";
// import fs from "fs";
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
const stat = promisify(fs.stat);


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

async function get_blog_data() {
    let blog1_data = await get_file_data("blog1.md");
    let blog2_data = await get_file_data("blog2.md");
    return blog_data = [
        {
            title: "Homelab Antics Part 1",
            slug: "homelab-1",
            body: blog1_data.body,
            date: "09-05-2020"
        },
        {
            title: "Cloud Failover",
            slug: "cloud-failover",
            body: blog2_data.body,
            date: "10-14-2020"
        }
    ]
}

exports.get_blog_data = get_blog_data