import {useState, useEffect, useCallback} from 'react';

/**
 * React hook to handle toggling a dropdown
 */
export default function useDropdown(
  dropdownRef: React.RefObject<HTMLElement>,
  actionRef: React.RefObject<HTMLElement>
) {
  const dropdownEl = dropdownRef.current;
  const actionEl = actionRef.current;

  const [drop, setDrop] = useState(false);

  const toggleDrop = useCallback(
    (toggleState?: boolean) => {
      setDrop(toggleState !== undefined ? Boolean(toggleState) : !drop);
    },
    [drop]
  );

  const onWindowClick = useCallback(
    ev => {
      const clickOnAction =
        actionEl && (ev.target === actionEl || actionEl.contains(ev.target));
      const clickOnDrop =
        dropdownEl && (ev.target === dropdownEl || dropdownEl.contains(ev.target));

      if (!clickOnAction && !clickOnDrop && drop === true) {
        toggleDrop(false);
      }
    },
    [drop]
  );

  const onEsc = useCallback(
    ev => ev.keyCode === 27 && drop === true && toggleDrop(false),
    [drop]
  );

  useEffect(() => {
    window.addEventListener('click', onWindowClick);
    return () => window.removeEventListener('click', onWindowClick);
  });

  useEffect(() => {
    window.addEventListener('keyup', onEsc);
    return () => window.removeEventListener('keyup', onEsc);
  });

  return [drop, toggleDrop] as const;
}
