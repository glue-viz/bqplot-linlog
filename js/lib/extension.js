__webpack_public_path__ = document.querySelector('body').getAttribute('data-base-url') + 'nbextensions/bqplot-linlog';

if (window.require) {
    window.require.config({
        map: {
            "*" : {
                "bqplot-linlog": "nbextensions/bqplot-linlog/index",
            }
        }
    });
}

module.exports = {
    load_ipython_extension: function() {}
};
