const crawlerAwait = require('./crawler-await');
const crawlerRp = require('./crawler-rp');
const textract = require('textract');
const _ = require('lodash');
const gramophone = require('gramophone');
const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const sw = require('stopword');
const fs = require('fs');
const json2csv = require('json2csv');
const async = require('async');
const moment = require('moment');


let liens_cat = {
    'http://www.mmsummit.com': 'Swapcard',
    'https://itarena.ua': 'Swapcard',
    'https://www.dldtelaviv.com': 'Swapcard',
    'http://startupistanbul.com': 'Swapcard',
    'https://outreach.io': 'Not Swapcard',
    'https://growthhackers.com': 'Not Swapcard',
    'http://www.europeanwomenintech.com': 'Swapcard',
    'https://mixpanel.com': 'Not Swapcard',
    'https://segment.com': 'Not Swapcard',
    'https://dmexco.de': 'Swapcard',
    //'https://www.southsummit.co' : 'Swapcard',
    'http://dublintechsummit.com': 'Swapcard',
    'https://www.bitsandpretzels.com': 'Swapcard',
    'http://www.contentmarketingworld.com': 'Swapcard',
    'http://www.digitalfreedomfestival.com': 'Swapcard',
    'https://hollandfintech.com/09-26-security-fintech-vortex': 'Swapcard',
    'http://tau-innovation.com': 'Swapcard',
    'https://vivatechnology.com': 'Swapcard',
    'http://dld-conference.com': 'Swapcard',
    'https://theeuropas.com': 'Swapcard',
    'https://arabnet.me/conference/kuwait': 'Swapcard',
    'http://thestartupconference.com/': 'Swapcard',
    'http://lafrenchtouchconference.net': 'Swapcard'

}

async.map(Object.keys(liens_cat), crawlAndExtract, function (err, results) {

    if (err) throw err;

    let csv = json2csv({data: results});

    let m = moment();

    console.log('Map <<<<===== ');

    fs.writeFile("./texts/" + m.format('H-m-s') + ".csv", csv, function (err) {
        console.log('Write');
        if (err) throw err;
    });

});

function crawlAndExtract(liens, callback) {
    crawlerRp.crawlWeb(liens).then(function (res) {

        Promise.all(res.map((url) => {
            return new Promise((resolve, reject) => {
                textract.fromUrl(url, function (err, text) {

                    if (!err) {

                        let textSplit = tokenizer.tokenize(text);
                        let textSplitUnique = _.uniq(textSplit);
                        // let removeStopwords = sw.removeStopwords(textSplitUnique, sw.en);
                        // let textResult = removeStopwords.join(' ');

                        resolve(textSplitUnique);

                    } else {
                        resolve();
                    }


                });
            });
        })).then((texts) => {

            console.log('Texts <<<<===== ');

            let allText = texts.join(' ');

            let data =
                {
                    text: allText,
                    cat: liens_cat[liens]
                };


            callback(null, data);

            // fs.writeFile("./texts/"+url, allText, function(err) {
            //     if (err) throw err;
            //     console.log('file saved');
            // });
            //
            // let fields = ['term', 'tf'];

            // let ngrams = gramophone.extract(allText, {
            //     score: true,
            //     ngrams : 1
            // });
            //
            // let csv = json2csv({ data: ngrams, fields: fields });
            //
            // fs.writeFile('./texts/'+url+'.csv', csv, function(err) {
            //   if (err) throw err;
            //   console.log('file saved');
            // });


        });

    });

}
