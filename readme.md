## Adtrack

Adtrack is a program that generates reports of the web's top sites and their use of advertising, marketing, and analytics trackers. It's intended to identify how we're tracked online, by what companies, and how often. More information can be found here: http://www.rezaparang.com/entries/7-how-often-are-we-tracked-online.

The program does the following:

* Uses the top Alexa sites by category, excluding regional and adult categories. The total number is 297 sites, after removing those categories and any repeats
* Requests each site’s front page
* Sniffs the outbound network requests for those sites for all resources (e.g., JavaScript files, stylesheets, images, HTML pages, and so forth)
* Checks each resource against a database of suspecting advertising, analytics, and marketing companies
* Delivers an audit of each site, specifying how many tracker URLs are used, what companies the site is using, and what data was sent about my visit

You can create a TSV to then make cool charts like this:

![](http://www.rezaparang.com/assets/top_sites_final-b38ede52fdf9afc5ee6a7deb721fa8f2.png)

## Requirements

* Node.js
* PhantomJS

> I recommend using the PhantomJS 2+ binaries that became available as of January 2015 since there are some nice performance improvements.

## Usage

* `git clone https://github.com/rparang/adtrack.git`
* `cd adtrack/`
* `mkdir reports`
* Seed the initial report files: `./bin/adtrack -s`
  * PhantomJS hangs _a lot_ on the sites that are resource-heavy. I could not find away around this. As such, if the program hangs, you can `control + c` and resume Adtrack. It begins again on the last site it exited on.

Once the report files have been seeded:

* TSV of the top sites and their number of tracker URLS: `./bin/adtrack --tsv sites`
* TSV of average trackers across categories: `./bin/adtrack --tsv category`
* TSV of percentage of company trackers across sites: `./bin/adtrack --tsv company`