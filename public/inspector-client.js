// 1code Inspector Client
// Add this ONE LINE to your app to enable inspector mode:
// <script src="http://localhost:5173/inspector-client.js"></script>

(function() {
  if (typeof window === 'undefined') return;

  let isInspectorActive = false;
  let overlay = null;
  let highlightBox = null;

  // Create visual overlay
  function createOverlay() {
    overlay = document.createElement('div');
    overlay.id = '1code-inspector-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 999999;
      cursor: crosshair;
      pointer-events: auto;
    `;

    highlightBox = document.createElement('div');
    highlightBox.style.cssText = `
      position: fixed;
      border: 2px solid #3b82f6;
      background: rgba(59, 130, 246, 0.1);
      pointer-events: none;
      z-index: 1000000;
      display: none;
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(highlightBox);
  }

  // Get component info from element
  function getComponentInfo(element) {
    // Try React Fiber (if React app)
    let fiber = null;
    for (let key in element) {
      if (key.startsWith('__reactFiber') || key.startsWith('__reactInternalInstance')) {
        fiber = element[key];
        break;
      }
    }

    let componentName = 'Unknown';
    let filePath = 'unknown';

    if (fiber) {
      // Walk up fiber tree to find component
      let current = fiber;
      while (current) {
        if (current.type && typeof current.type === 'function') {
          componentName = current.type.name || current.type.displayName || 'Component';

          // Try to get source location from dev mode
          if (current._debugSource) {
            filePath = current._debugSource.fileName;
          } else if (current.type.__source) {
            filePath = current.type.__source.fileName;
          }
          break;
        }
        current = current.return;
      }
    }

    // Fallback to tag name
    if (componentName === 'Unknown') {
      componentName = element.tagName.toLowerCase();
    }

    return { component: componentName, path: filePath };
  }

  // Handle mouse move - highlight element
  function handleMouseMove(e) {
    if (!isInspectorActive) return;

    const element = document.elementFromPoint(e.clientX, e.clientY);
    if (!element || element === overlay || element === highlightBox) return;

    const rect = element.getBoundingClientRect();
    highlightBox.style.display = 'block';
    highlightBox.style.top = rect.top + 'px';
    highlightBox.style.left = rect.left + 'px';
    highlightBox.style.width = rect.width + 'px';
    highlightBox.style.height = rect.height + 'px';
  }

  // Handle click - select element
  function handleClick(e) {
    if (!isInspectorActive) return;

    e.preventDefault();
    e.stopPropagation();

    const element = document.elementFromPoint(e.clientX, e.clientY);
    if (!element || element === overlay || element === highlightBox) return;

    const info = getComponentInfo(element);

    // Send to parent (1code)
    window.parent.postMessage({
      type: 'INSPECTOR_ELEMENT_SELECTED',
      data: info
    }, '*');

    console.log('[1code Inspector] Selected:', info);
  }

  // Toggle inspector mode
  function toggleInspector(enabled) {
    isInspectorActive = enabled;

    if (enabled) {
      if (!overlay) createOverlay();
      overlay.style.display = 'block';
      overlay.addEventListener('mousemove', handleMouseMove);
      overlay.addEventListener('click', handleClick);
      console.log('[1code Inspector] Active - Click any element to select');
    } else {
      if (overlay) overlay.style.display = 'none';
      if (highlightBox) highlightBox.style.display = 'none';
      console.log('[1code Inspector] Inactive');
    }
  }

  // Listen for messages from parent
  window.addEventListener('message', (event) => {
    if (event.data?.type === 'TOGGLE_INSPECTOR') {
      toggleInspector(event.data.enabled);
    }
  });

  console.log('[1code Inspector] Client loaded and ready');
})();
