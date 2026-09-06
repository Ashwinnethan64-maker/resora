// Resora Extension Popup Script
document.addEventListener('DOMContentLoaded', async () => {
  const titleInput = document.getElementById('title');
  const urlInput = document.getElementById('url');
  const tagsInput = document.getElementById('tags');
  const noteInput = document.getElementById('note');
  const saveBtn = document.getElementById('save-btn');
  const statusEl = document.getElementById('status');

  // Query active browser tab
  if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        titleInput.value = tabs[0].title || '';
        urlInput.value = tabs[0].url || '';
      }
    });
  } else {
    // Demo fallback when testing in local browser
    titleInput.value = 'LangGraph Documentation';
    urlInput.value = 'https://langchain-ai.github.io/langgraph/';
  }

  saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    statusEl.style.display = 'none';

    const payload = {
      url: urlInput.value,
      title: titleInput.value,
      note: noteInput.value,
      tags: tagsInput.value.split(',').map((t) => t.trim()).filter(Boolean),
    };

    try {
      const endpoint = 'http://localhost:3000/api/capture';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        statusEl.className = 'status success';
        statusEl.textContent = '✓ Saved to Resora Library!';
        statusEl.style.display = 'block';
        setTimeout(() => window.close(), 1200);
      } else {
        throw new Error(data.error || 'Failed to save');
      }
    } catch (err) {
      statusEl.className = 'status error';
      statusEl.textContent = err.message || 'Error saving to Resora';
      statusEl.style.display = 'block';
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save to Resora';
    }
  });
});
