module.exports = {
  dependencies: {
    'react-native-video': {
      platforms: {
        android: {
          sourceDir: '../node_modules/react-native-video/android',
          packageImportPath: 'import com.brentvatne.react.ReactVideoPackage;',
          packageInstance: 'new ReactVideoPackage()',
        },
      },
    },
  },
};
