/**
 * The default browser source styles that OBS injects for a new browser source.
 *
 * We should remove these default since the margin auto will break alignment
 * for our overlays
 */
const DEFAULT_STYLES =
  'body { background-color: rgba(0, 0, 0, 0); margin: 0px auto; overflow: hidden; }';

/**
 * Locate the style element containing the default OBS browser source styles
 */
export const findDefaultOBSStlyeNode = () =>
  Array.from(document.querySelectorAll('head style:not([data-emotion])')).find(
    el => el.innerHTML === DEFAULT_STYLES
  );

export const ensureNoOBSDefaultStyles = () => {
  findDefaultOBSStlyeNode()?.remove();

  const head = document.querySelector('head');

  if (head === null) {
    return () => null;
  }
  const observer = new MutationObserver(() => {
    findDefaultOBSStlyeNode()?.remove();
  });

  observer.observe(head, {childList: true, attributes: false});

  return () => observer.disconnect();
};
