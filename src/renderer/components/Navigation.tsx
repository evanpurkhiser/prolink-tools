import * as React from 'react';
import {Activity, Layers, Menu, Settings} from 'react-feather';
import {NavLink, useLocation} from 'react-router-dom';
import styled from '@emotion/styled';
import {AnimatePresence, motion} from 'framer-motion';

import useDropdown from 'src/utils/useDropdown';

const items = [
  {name: 'Device Status', path: '/status', icon: Activity},
  {name: 'Overlays', path: '/overlay-config', icon: Layers},
  {name: 'Settings', path: '/settings', icon: Settings},
] as const;

const Navigation = () => {
  const dropdownRef = React.useRef(null);
  const actionRef = React.useRef(null);
  const [isOpen, toggleDropdown] = useDropdown(dropdownRef, actionRef);

  const location = useLocation();

  return (
    <Container>
      <MenuButton onClick={() => toggleDropdown()} ref={actionRef}>
        {items.find(i => location?.pathname.startsWith(i.path))?.name}
        <Menu size="1rem" />
      </MenuButton>
      <AnimatePresence>
        {isOpen && (
          <MenuContainer ref={dropdownRef} key={isOpen.toString()}>
            {items.map(item => (
              <MenuItem key={item.name} to={item.path} onClick={() => toggleDropdown()}>
                <item.icon size="1rem" />
                {item.name}
              </MenuItem>
            ))}
          </MenuContainer>
        )}
      </AnimatePresence>
    </Container>
  );
};

const Container = styled('div')`
  position: relative;
  font-size: 0.8rem;
  font-weight: 500;
  display: flex;
  align-items: center;
`;

const MenuButton = styled('button')`
  border: none;
  background: none;
  padding: 0.5rem;
  font-size: 0.7rem;
  display: grid;
  grid-auto-flow: column;
  grid-auto-rows: max-content;
  grid-gap: 0.5rem;
  align-items: center;
  text-transform: uppercase;
  font-weight: 600;
  color: #5b5b5b;

  &:hover {
    color: #000;
  }
`;

const MenuContainer = styled(motion.div)`
  position: absolute;
  top: 38px;
  right: -10px;
  background: #fff;
  display: grid;
  grid-auto-flow: row;
  grid-auto-rows: max-content;
  grid-gap: 0.125rem;
  padding: 0.25rem 0;
  border: 1px solid #eee;

  &:before,
  &:after {
    content: '';
    display: block;
    position: absolute;
    top: -16px;
    right: 18px;
    border: 8px solid transparent;
    border-bottom-color: #fff;
  }

  &:before {
    margin-top: -1px;
    border-bottom-color: #eee;
  }
`;

MenuContainer.defaultProps = {
  initial: {opacity: 0, y: 5, originX: '80%', originY: 0},
  animate: {opacity: 1, y: 0},
  exit: {opacity: 0, scale: 0.95},
  transition: {duration: 0.2},
};

const MenuItem = styled(NavLink)`
  padding: 0.375rem 0.75rem;
  display: grid;
  grid-template-columns: max-content 1fr;
  grid-gap: 0.5rem;
  align-items: center;
  text-transform: uppercase;
  font-weight: 600;
  font-size: 0.7rem;
  text-decoration: none;
  white-space: nowrap;
  color: #3b434b;

  &:hover {
    color: #000;
    background: #f5f5f5;
  }
`;

export default Navigation;
