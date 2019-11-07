/* eslint-disable
  global-require,
  import/no-dynamic-require,
*/
const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const { Router } = require('express');

const timeout = 1000;

const timeoutMiddleware = (req, res, next) => {
  if (timeout) {
    setTimeout(() => {
      next();
    }, 1000);
  } else {
    next();
  }
};

const jsonMiddleware = (req, res, next) => {
  if (!process.env.NO_FORMAT_JSON) {
    res.rawJson = res.json;
    res.json = function json(data) {
      res.rawJson({
        success: true,
        message: 'success',
        data,
      });
    };
  }
  next();
};

const corsMiddleware = (req, res, next) => {
  res.append('Access-Control-Allow-Origin', '*');
  res.append('Access-Control-Allow-Methods', '*');
  res.append('Access-Control-Allow-Headers', '*');
  next();
};

const middlewares = [
  bodyParser.json(),
  timeoutMiddleware,
  jsonMiddleware,
  corsMiddleware,
  //
];

function initEntry(entry, rootRouter) {
  let router;
  const watcher = chokidar.watch(entry);
  function registerMock() {
    // clear
    rootRouter.stack = rootRouter.stack.filter(item => item.handle !== router);
    Object.keys(require.cache).forEach(id => {
      if (id.startsWith(entry)) delete require.cache[id];
    });

    // add newer
    router = Router();
    rootRouter.use(router);
    const mock = require(entry);
    Object.entries(mock).forEach(([item, handler]) => {
      let method = 'get';
      let url = item;
      if (item.includes(' ')) {
        method = item.split(' ')[0].toLowerCase();
        url = item.split(' ')[1];
      }
      router[method](url, ...middlewares);
      if (typeof handler === 'function') {
        router[method](url, (req, res, next) => handler(req, res, next));
      } else {
        router[method](url, (req, res) => {
          res.json(handler);
        });
      }
    });
  }
  watcher.on('ready', () => {
    registerMock();
    watcher.on('all', () => {
      registerMock();
    });
  });
}

module.exports = app => {
  const router = Router();
  app.use(router);
  const PAGE_DIR = './mock';
  fs.readdir(PAGE_DIR, (err, dirs) => {
    if (!err) {
      const mockEntries = [];
      dirs.forEach(file => {
        if (/\.js$/.test(file)) {
          try {
            const filePath = path.resolve(PAGE_DIR, file);
            require.resolve(filePath);
            mockEntries.push(filePath);
          } catch (_) {
            //
          }
        }
      });
      mockEntries.forEach(entry => initEntry(entry, router));
    }
  });
};
