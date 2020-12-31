import * as React from 'react';
import {Activity, Layers, Settings} from 'react-feather';
import {NavLink, useLocation} from 'react-router-dom';
import styled from '@emotion/styled';
import {AnimateSharedLayout, motion} from 'framer-motion';
import {observer} from 'mobx-react';

import store from 'src/shared/store';

import HelpButton from './HelpButton';

const items = [
  {name: 'Device Status', path: '/status', icon: Activity},
  {name: 'Overlays', path: '/overlay-config', icon: Layers},
  {name: 'Settings', path: '/settings', icon: Settings},
] as const;

const Navigation = observer(() => (
  <MenuContainer>
    <SidebarToggle onClick={() => store.config.toggleSidebar()} />
    <AnimateSharedLayout>
      {items.map(item => (
        <MenuItem key={item.name} to={item.path} aria-current="page">
          {item.path === useLocation().pathname && <ActiveIndicator layoutId="active" />}
          <item.icon size="1rem" />
          {!store.config.sidebarCollapsed && item.name}
        </MenuItem>
      ))}
    </AnimateSharedLayout>
    <Bottom>
      <HelpButton />
    </Bottom>
  </MenuContainer>
));

const MenuContainer = styled(motion.nav)`
  position: relative;
  height: 100%;
  border-right: 1px solid ${p => p.theme.border};
  display: flex;
  flex-direction: column;
  grid-gap: 0.125rem;
  padding: 0.5rem 0;
`;

const SidebarToggle = styled('div')`
  position: absolute;
  top: 0;
  bottom: 0;
  right: -1px;
  width: 2px;
  z-index: 2;
  transition: background 150ms ease-in-out;
  cursor: pointer;

  &:before {
    content: '';
    width: 5px;
    position: absolute;
    top: 0;
    bottom: 0;
    left: -1px;
  }

  &:hover {
    transition-delay: 300ms;
    background: #f95757;
  }
`;

const MenuItem = styled(NavLink)`
  position: relative;
  padding: 0.375rem 0.75rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
  text-transform: uppercase;
  font-weight: 600;
  font-size: 0.7rem;
  text-decoration: none;
  white-space: nowrap;
  color: ${p => p.theme.primaryText};

  &:hover {
    background: ${p => p.theme.backgroundSecondary};
  }
`;

const ActiveIndicator = styled(motion.div)`
  position: absolute;
  background: ${p => p.theme.subText};
  height: 10px;
  margin: 0.125rem 0;
  width: 2px;
  border-radius: 2px;
  left: 6px;
`;

const Bottom = styled('div')`
  display: flex;
  align-items: flex-end;
  flex-grow: 1;
  padding: 0 0.5rem;
`;

export default Navigation;
