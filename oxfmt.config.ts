import {oxfmt} from '@evanpurkhiser/oxc-config/oxfmt';
import {defineConfig} from 'oxfmt';

export default defineConfig({
  ...oxfmt,
  sortImports: {
    sortSideEffects: true,
    customGroups: [
      {
        groupName: 'react-libs',
        selector: 'external',
        elementNamePattern: ['react', 'react-**'],
      },
      {
        groupName: 'project-internal',
        selector: 'import',
        elementNamePattern: [
          'src',
          'src/**',
          'ui',
          'ui/**',
          'main',
          'main/**',
          'server',
          'server/**',
          'overlay',
          'overlay/**',
          'web',
          'web/**',
        ],
      },
    ],
    groups: [
      'side_effect',
      'react-libs',
      'external',
      'builtin',
      'project-internal',
      'parent',
      ['sibling', 'index'],
      'unknown',
    ],
  },
});
