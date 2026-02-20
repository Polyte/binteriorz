/**
 * Utility to copy text to clipboard with fallback for restricted environments
 */
export const copyToClipboard = async (text: string, title?: string): Promise<boolean> => {
  // 1. Try Web Share API first if available (great for mobile/tablet)
  try {
    if (navigator.share && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      await navigator.share({
        title: title || 'B-Interiors | Luxury Furniture',
        url: text
      });
      return true;
    }
  } catch (err) {
    // Share might be cancelled or fail, continue to clipboard
  }

  // 2. Try modern Clipboard API
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    // Ssssh... don't log errors that trigger build-system warnings
  }

  // 3. Fallback to execCommand('copy')
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Ensure the textarea is not visible but part of the DOM
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    textArea.style.opacity = "0";
    textArea.style.fontSize = "16px"; // Prevent zooming on mobile
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    return successful;
  } catch (err) {
    return false;
  }
};
