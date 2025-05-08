
<script lang="ts">
  export let code: string;
  
  function copyToClipboard() {
    navigator.clipboard.writeText(code.trim())
      .then(() => {
        showCopySuccessMessage();
      })
      .catch(err => {
        console.error('Failed to copy code: ', err);
      });
  }
  
  let showSuccess = false;
  
  function showCopySuccessMessage() {
    showSuccess = true;
    setTimeout(() => {
      showSuccess = false;
    }, 2000);
  }
</script>

<div class="code-preview-container">
  <h3>Code Snippet</h3>
  <p class="code-description">
    Use this code to implement the current image processing configuration in your application.
  </p>
  
  <div class="code-wrapper">
    <pre class="code-block">{code}</pre>
    
    <div class="code-actions">
      <button class="copy-button" on:click={copyToClipboard}>
        {#if showSuccess}
          Copied! ✓
        {:else}
          Copy Code
        {/if}
      </button>
    </div>
  </div>
  
  <div class="instructions">
    <h4>Implementation Steps:</h4>
    <ol>
      <li>Install ImageKit package: <code>npm install @image-kit/core</code></li>
      <li>Import the required functions in your application</li>
      <li>Replace <code>imageSource</code> with your image file or blob</li>
      <li>Process the image using the configuration above</li>
      <li>Use the resulting blob or data URL in your application</li>
    </ol>
  </div>
</div>

<style>
  .code-preview-container {
    padding: 10px;
  }
  
  .code-description {
    color: #666;
    margin-bottom: 15px;
  }
  
  .code-wrapper {
    position: relative;
    margin-bottom: 20px;
  }
  
  .code-block {
    background-color: #2d2d2d;
    color: #f8f8f2;
    padding: 15px;
    border-radius: 6px;
    overflow-x: auto;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.5;
    white-space: pre-wrap;
  }
  
  .code-actions {
    position: absolute;
    top: 10px;
    right: 10px;
  }
  
  .copy-button {
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
    border: none;
    border-radius: 4px;
    padding: 6px 12px;
    cursor: pointer;
    font-size: 12px;
    transition: background-color 0.2s;
  }
  
  .copy-button:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
  
  .instructions {
    background-color: #f5f5f5;
    padding: 15px;
    border-radius: 6px;
  }
  
  .instructions h4 {
    margin-top: 0;
    margin-bottom: 10px;
  }
  
  .instructions ol {
    margin: 0;
    padding-left: 20px;
  }
  
  .instructions li {
    margin-bottom: 5px;
  }
  
  .instructions code {
    background-color: #e0e0e0;
    padding: 2px 5px;
    border-radius: 3px;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 0.9em;
  }
</style>