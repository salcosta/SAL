var Crawler = require("crawler");

var c = new Crawler({
    "maxConnections": 10,
    skipDuplicates :true,

    // This will be called for each crawled page
    "callback": function(error, result, $) {


    	$(".field-name-body").each(function() {
            console.log($(this).text());
        });

        $("a").each(function(index, a) {
        	console.log(a.href);
            c.queue(a.href);
        });
    }
});

c.queue("http://kb.its.psu.edu");