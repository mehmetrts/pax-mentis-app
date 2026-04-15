const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Support .lottie (dotLottie) files as assets
config.resolver.assetExts.push("lottie");

module.exports = config;
