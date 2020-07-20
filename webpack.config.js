const path = require('path');
const glob = require('glob');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const Dotenv = require('dotenv-webpack');

const src = 'src';
const dist = 'dist';

module.exports = {
  entry: glob.sync('**/*.js', { cwd: src, ignore: 'lib/*' }).reduce((o, name) => (
    { ...o, [path.join(src, name)]: path.resolve(src, name) }
  ), {}),
  output: {
    path: path.join(__dirname, dist),
    filename: '[name]'
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        ...glob.sync('**/*.css', { cwd: src }).map((name) => ({
          from: path.resolve(src, name),
          to: path.join(__dirname, dist, src, name)
        })),
        {
          from: '**/*',
          context: 'public'
        }
      ]
    }),
    new Dotenv()
  ]
};
