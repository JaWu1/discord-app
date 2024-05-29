const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
	emoji: String,
	name: String,
	quantity: Number,
});

const profileSchema = new mongoose.Schema({
	userId: { type: String, require: true, unique: true },
	serverId: { type: String, require: true },
	balance: { type: Number, default: 10 },
	dailyLastUsed: { type: Number, default: 0 },
	searchLastUsed: { type: Number, default: 0 },
	star4: { type: Number, default: 0 },
	star5: { type: Number, default: 0 },
	guaranteedBanner: { type: Boolean, default: false },
	inventory: [itemSchema],
	lootLastUsed: { type: Number, default: 0 },
});

const model = mongoose.model('JaWudb', profileSchema);

module.exports = model;