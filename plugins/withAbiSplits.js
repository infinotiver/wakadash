const { withAppBuildGradle, withGradleProperties } = require('@expo/config-plugins');

module.exports = function withAbiSplits(config) {
    const abis = ['arm64-v8a', 'armeabi-v7a'];
    if (process.env.INCLUDE_X86_64 === '1') abis.push('x86_64');

    config = withAppBuildGradle(config, (config) => {
        if (config.modResults.language === 'groovy') {
            const splitsBlock = `
    splits {
        abi {
            reset()
            enable true
            universalApk false
            include ${abis.map((a) => `"${a}"`).join(', ')}
        }
    }`;

            if (!config.modResults.contents.includes('splits {')) {
                config.modResults.contents = config.modResults.contents.replace(
                    /android\s*\{/,
                    `android {${splitsBlock}`
                );
            }
        }
        return config;
    });

    config = withGradleProperties(config, (config) => {
        const value = abis.join(',');
        const existing = config.modResults.find(
            (item) => item.type === 'property' && item.key === 'reactNativeArchitectures'
        );
        if (existing) existing.value = value;
        else config.modResults.push({ type: 'property', key: 'reactNativeArchitectures', value });
        return config;
    });

    return config;
};