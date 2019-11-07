const {
  override,
  overrideDevServer,
  addLessLoader,
  fixBabelImports,
  addBundleVisualizer,
  removeModuleScopePlugin,
  disableEsLint,
  addBabelPlugin,
  addWebpackModuleRule,
  useEslintRc,
  addWebpackAlias,
} = require('customize-cra');
const ForkTsCheckerWebpackPlugin = require('react-dev-utils/ForkTsCheckerWebpackPlugin');
const fs = require('fs');
const path = require('path');
const mockMiddleware = require('./mockMiddleware');

const projectConfigOverrides = {};
try {
  const customConfigOverrides = require(path.resolve(
    fs.realpathSync(process.cwd()),
    './config-overrides',
  ));
  if (typeof customConfigOverrides === 'function')
    projectConfigOverrides.webpack = customConfigOverrides;
  else Object.assign(projectConfigOverrides, customConfigOverrides);
} catch (error) {
  //
}

module.exports = {
  webpack: override(
    addLessLoader({
      javascriptEnabled: true,
    }),
    fixBabelImports('antd', {
      style: true,
      libraryDirectory: 'es',
    }),
    addBundleVisualizer({}, true),
    removeModuleScopePlugin(),
    addWebpackAlias({ '@/': './src' }),
    process.env.NODE_ENV === 'development' && addBabelPlugin('react-hot-loader/babel'),
    useEslintRc(),
    (config, env) => {
      // eslint resolvePluginsRelativeTo
      const eslintRule = config.module.rules.filter(
        r => r.use && r.use.some(u => u.options && u.options.useEslintrc !== void 0),
      )[0];
      if (eslintRule) delete eslintRule.use[0].options.resolvePluginsRelativeTo;
      return config;
    },
    process.env.NODE_ENV === 'production' && disableEsLint(),
    process.env.NODE_ENV === 'production' &&
      (config => {
        const ts = config.plugins.findIndex(item => item instanceof ForkTsCheckerWebpackPlugin);
        if (ts !== -1) {
          config.plugins.splice(ts, 1);
        }
        // process.exit();
        return config;
      }),
    addWebpackModuleRule({
      test: /\.js/,
      include: /node_modules(?:\/|\\)react-dom/,
      use: ['react-hot-loader/webpack'],
    }),
    projectConfigOverrides.webpack,
  ),
  devServer: override(
    overrideDevServer(config => {
      const { before } = config;
      config.before = (app, server) => {
        mockMiddleware(app);
        before(app, server);
      };
      return config;
    }),
    projectConfigOverrides.devServer,
  ),
  jest: projectConfigOverrides.jest,
  paths: projectConfigOverrides.paths,
};
