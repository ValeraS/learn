import { template as _template } from 'lodash';
import { combineLatest, from, of } from 'rxjs';
import { flatMap, map, reduce, shareReplay } from 'rxjs/operators';
import cond from 'lodash/cond';
import flow from 'lodash/flow';
import identity from 'lodash/identity';
import matchesProperty from 'lodash/matchesProperty';
import partial from 'lodash/partial';
import stubTrue from 'lodash/stubTrue';

import { fetchScript, fetchLink } from '../utils/fetch-and-cache.js';
import { compileHeadTail, setExt, transformContents } from '../utils/polyvinyl';

const htmlCatch = '\n<!--fcc-->\n';
const jsCatch = '\n;/*fcc*/\n';

const defaultTemplate = ({ source }) => `
  <body style='margin:8px;'>
    <!-- fcc-start-source -->
      ${source}
    <!-- fcc-end-source -->
  </body>
`;

const wrapInScript = partial(
  transformContents,
  content => `${htmlCatch}<script>${content}${jsCatch}</script>`
);
const wrapInStyle = partial(
  transformContents,
  content => `${htmlCatch}<style>${content}</style>`
);
const setExtToHTML = partial(setExt, 'html');
const padContentWithJsCatch = partial(compileHeadTail, jsCatch);
const padContentWithHTMLCatch = partial(compileHeadTail, htmlCatch);

export const jsToHtml = cond([
  [
    matchesProperty('ext', 'js'),
    flow(padContentWithJsCatch, wrapInScript, setExtToHTML)
  ],
  [stubTrue, identity]
]);

export const cssToHtml = cond([
  [
    matchesProperty('ext', 'css'),
    flow(padContentWithHTMLCatch, wrapInStyle, setExtToHTML)
  ],
  [stubTrue, identity]
]);

// FileStream::concatHtml(
//   required: [ ...Object ],
//   template: String
// ) => Observable[{ build: String, sources: Dictionary }]
export function concatHtml(required, template) {
  const createBody = template ? _template(template) : defaultTemplate;
  const source = this.pipe(shareReplay());
  const sourceMap = source.pipe(flatMap(files =>
    files.pipe(reduce((sources, file) => {
      sources[file.name] = file.source || file.contents;
      return sources;
    }, {}))
  ));

  const head = from(required).pipe(
    flatMap(required => {
      if (required.src) {
        return fetchScript(required);
      }
      if (required.link) {
        return fetchLink(required);
      }
      return of('');
    }),
    reduce((head, required) => head + required, ''),
    map(head => `<head>${head}</head>`)
  );

  const body = source.pipe(
    flatMap(file =>
      file.pipe(reduce((body, file) => {
        return body + file.contents + file.tail + htmlCatch;
      }, ''))
    ),
    map(source => ({ source })),
    map(createBody)
  );

  return combineLatest(
    head,
    body,
    fetchScript({
      src: '/js/frame-runner.js',
      crossDomain: false,
      cacheBreaker: true
    }),
    sourceMap,
    (head, body, frameRunner, sources) => ({
      build: head + body + frameRunner,
      sources
    })
  );
}
