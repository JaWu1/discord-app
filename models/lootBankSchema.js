const mongoose = require('mongoose');

const lootBankSchema = new mongoose.Schema({
    bankBalance: {
        type: Number,
        required: true,
        default: 0,
    },
});

const lootBankModel = mongoose.model('LootBank', lootBankSchema);
module.exports = lootBankModel;
