const mongoose = require("mongoose");

module.exports = url => {
    mongoose.connect(url, {
        autoIndex: false,
    }).then(async () => {
        console.log(`> "MongoDB Models" is started the bot`);
    }).catch(async (err) => {
        console.error(err);
    });
};