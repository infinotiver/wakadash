const { withAppBuildGradle, withGradleProperties } = require('@expo/config-plugins');

module.exports = function withAbiSplits(config) {
    // 1. Inject ABI splits into android/app/build.gradle
    config = withAppBuildGradle(config, (config) => {
        if (config.modResults.language === 'groovy') {
            const splitsBlock = `
    splits {
        abi {
            reset()
            enable true
            universalApk false
            include "arm64-v8a", "armeabi-v7a"
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

    // 2. Limit architectures in android/gradle.properties
    config = withGradleProperties(config, (config) => {
        const existingProp = config.modResults.find(
            (item) => item.type === 'property' && item.key === 'reactNativeArchitectures'
        );

        if (existingProp) {
            existingProp.value = 'armeabi-v7a,arm64-v8a';
        } else {
            config.modResults.push({
                type: 'property',
                key: 'reactNativeArchitectures',
                value: 'armeabi-v7a,arm64-v8a',
            });
        }

        return config;
    });

    return config;
};
