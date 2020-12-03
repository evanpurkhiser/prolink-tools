import {app, Menu, shell} from 'electron';

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
    submenu: [{role: 'reload'}, {role: 'forceReload'}, {role: 'togglefullscreen'}],
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
    ],
  },
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
