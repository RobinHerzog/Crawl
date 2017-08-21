/*
    By Robin Herzog

    Goal : Give a score to each leads in order to focus sales on good leads.

    What we have:

        1. Email
        2. First name & Last Name
        3. Company domain name
        4. Linkedin Profile
        5. Keywords
        6. Job
        7. Company name
        8. Industry in french

    Type of possible website :

        1. Agency event (https://www.dynamicevents.com/)
        2. WTF website like universalmusic.com
        3. Website of a particular event
        4. Website of organizer but not in French Or English


    Why qualify :

        1. AnyLeads will get many leads but not all of them organize event tech conferences. Qualify allows leads to focus on better potential leads.

    How to qualify:

        1. People is already filter by Linkedin Criteria but it can't be precise enough.
        2. On Keywords, Job and Company Name data is limited. Linkedin url profile is know but how to access it?
        3. Idea 1 : Analyse company domain to find words such as (tech, event, summit...)

    Hypothesis:

        1. The domain contains many keywords that match with our criteria
        2. The domain does not match BUT Linkedin Profile match with our criteria
        3. The domain and Linkedin does not match with our criteria
        4. AnyLeads can't find the email but we could find it with the mail

    Machine Learning:

        1. Website texts could be classified with ML
        2. Linkedin Profile could be classified with ML

    To Do:

        1. Get all url from website
        2. Extract all texts from it
        3. Compare with critera
        4. Give a note

 */


/*
  @Website scoring

  Whats makes a good website :

    1. Finding specific words (ML?)
    2. Finding events they organize
    3. Read their company page on Linkedin
*/

const request = require('request');
const cheerio = require('cheerio');
const Url = require('url');
const parseDomain = require("parse-domain");
const validUrl = require('valid-url');
const followRedirects = require('follow-redirects');
const rp = require('request-promise');

var exports = module.exports = {};

exports.crawlWeb = function (startUrl, callback) {

    return new Promise((resolve) => {


        console.log('Crawler started');

        var listUrl = [];

        var baseParsedStartUrl = Url.parse(startUrl);
        var baseStartUrl = baseParsedStartUrl.protocol + '//' + baseParsedStartUrl.hostname;

        var pagesVisited = {};
        var numPagesVisited = 0;
        var pagesToVisit = [];

        pagesToVisit.push(startUrl);
        crawl();

        function crawl() {

            if (numPagesVisited >= 10) {
                resolve(Object.keys(pagesVisited));
                return;
            }

            let nextPage = pagesToVisit.pop();

            if (nextPage in pagesVisited) {
                crawl();
            } else {
                if (nextPage) {
                    collectInternalLinks(nextPage, crawl);
                }
            }

            if (nextPage === undefined) {
                resolve(Object.keys(pagesVisited));
            }
        }

        function collectInternalLinks(startUrl, callback) {

            let options = {
                uri: startUrl,
                resolveWithFullResponse: true,
                simple: false
            };

            rp(options)
                .then(function (response) {

                    //if(response.statusCode === 200){

                    $ = cheerio.load(response.body);

                    console.log(startUrl);
                    console.log(numPagesVisited + '<= RP =================================');

                    pagesVisited[startUrl] = true;
                    numPagesVisited++;

                    let parcedStartDomain = Url.parse(startUrl);

                    $("a").each(function (index, a) {

                        let toQueueUrl = $(a).attr('href');

                        if (toQueueUrl) {

                            //Permet de transformer les liens relative en absolue
                            let parsedUrlOrigin = Url.parse(toQueueUrl);
                            toQueueUrl = Url.resolve(baseStartUrl, parsedUrlOrigin.href);
                            let parsedUrl = Url.parse(toQueueUrl);

                            // La fonction parseDomain ne supporte pas les TLD comme .see
                            //let parsedUrlDomain = parseDomain(parsedUrl.host);

                            if (validUrl.isUri(parsedUrl.href)) {

                                if ((toQueueUrl.match(/(https?:\/\/[-\w;\/?:@&=+$\|\_.!~*\|'()\[\]%#,☺]+[\w\/#](\(\))?)(?=$|[\s',\|\(\).:;?\-\[\]>\)])/) && !toQueueUrl.match(['#']) && !toQueueUrl.match(['mailto'])
                                        && !toQueueUrl.match(/^https?:\/\/(?:[a-z\-]+\.)+[a-z]{2,6}(?:\/[^\/#?]+)+\.(?:jpe?g|gif|png|pdf|mp3|mp4|eps|JPG)$/)) || (parsedUrl.hostname === null
                                        && toQueueUrl.match(/((\/[a-zA-Z][a-z[A-Z]*)+?)/)) && !toQueueUrl.match(/.(?:jpe?g|gif|png|pdf|mp3|mp4|eps|JPG)$/)) {
                                    //console.log(parsedUrl);
                                    //console.log(parsedUrlDomain);

                                    if (parcedStartDomain.hostname === parsedUrl.hostname) {
                                        console.log(toQueueUrl);
                                        pagesToVisit.push(toQueueUrl);
                                    }
                                }
                            }
                        }


                    });
                    callback(listUrl);

                    //}

                }).catch(function (err) {
                console.log(err);
            });
        }

    });
};
