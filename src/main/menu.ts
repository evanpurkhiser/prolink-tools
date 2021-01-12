import {app, Menu, shell} from 'electron';

import {AppStore} from 'src/shared/store';

export function setupMenu(store: AppStore) {
  const isMac = process.platform === 'darwin';

  const template: Electron.MenuItemConstructorOptions[] = [
    ...((isMac
      ? [
          {
            label: app.name,
            submenu: [
              {role: 'about'},
              {type: 'separator'},
              {role: 'services'},
              {type: 'separator'},
              {role: 'hide'},
              {role: 'hideothers'},
              {role: 'unhide'},
              {type: 'separator'},
              {role: 'quit'},
            ],
          },
        ]
      : []) as Electron.MenuItemConstructorOptions[]),
    {
      label: 'Edit',
      submenu: [
        {role: 'undo'},
        {role: 'redo'},
        {type: 'separator'},
        {role: 'cut'},
        {role: 'copy'},
        {role: 'paste'},
        {role: 'delete'},
        {type: 'separator'},
        {role: 'selectAll'},
      ],
    },
    {
      label: 'View',
      submenu: [
        {role: 'reload'},
        {role: 'forceReload'},
        {role: 'togglefullscreen'},
        {
          accelerator: 'cmd + option + s',
          label: 'Toggle Sidebar',
          click: () => store.config.toggleSidebar(),
        },
        {
          visible: false,
          accelerator: 'cmd + l',
          label: 'Toggle UI Theme',
          click: () => store.config.toggleTheme(),
        },
      ],
    },
    {
      label: 'Window',
      submenu: [
        {role: 'minimize'},
        {role: 'zoom'},
        ...((isMac
          ? [{type: 'separator'}, {role: 'front'}, {type: 'separator'}, {role: 'window'}]
          : [{role: 'close'}]) as Electron.MenuItemConstructorOptions[]),
      ],
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click: () => shell.openExternal('https://prolink.tools/'),
        },
        {
          label: 'User Manual',
          click: () => shell.openExternal('https://prolink.tools/manual'),
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
