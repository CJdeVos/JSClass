require.config({
    baseUrl: 'scripts',
    urlArgs: "bust=" + (new Date()).getTime()/*,
    map: {
        '*': { 
            "jquery": "jquery-private",
            "netfeatures": "NF"
        },
        "jquery-private": { "jquery": 'jquery' }
    }*/
});