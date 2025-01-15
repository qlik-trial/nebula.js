import express from 'express';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const FN = fileURLToPath(import.meta.url);
const DN = dirname(FN);

export default async function startServer(port) {
  const app = express();
  // const port = 8050;
  const url = `http://localhost:${port}`;
  app.use(express.static(path.resolve(DN)));
  app.use('/apis', express.static(path.resolve(DN, '../../apis')));
  app.use('/node_modules', express.static(path.resolve(DN, '../../node_modules')));

  let server;

  await new Promise((resolve) => {
    server = app.listen(port, () => {
      console.log(`Running rendering server at ${url}`);
      resolve();
    });
  });

  const destroy = () => {
    server.close();
  };

  return {
    url,
    destroy,
  };
}

export function getPaths(dir) {
  return path.join(DN, dir);
}
