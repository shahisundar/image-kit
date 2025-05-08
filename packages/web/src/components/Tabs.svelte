<!-- web/src/components/Tabs.svelte -->
<script lang="ts">
  export let tabs: Array<{
    id: string;
    label: string;
  }>;
  export let activeTab: string;
  
  function setActiveTab(id: string) {
    activeTab = id;
  }
</script>

<div class="tabs-container">
  <div class="tabs">
    {#each tabs as tab}
      <button 
        class="tab-button {activeTab === tab.id ? 'active' : ''}" 
        on:click={() => setActiveTab(tab.id)}
      >
        {tab.label}
      </button>
    {/each}
  </div>
</div>

<style>
  .tabs-container {
    margin-bottom: 10px;
  }
  
  .tabs {
    display: flex;
    border-bottom: 2px solid #e0e0e0;
    overflow-x: auto;
  }
  
  .tab-button {
    padding: 10px 20px;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
    cursor: pointer;
    font-weight: bold;
    color: #666;
    transition: all 0.2s;
    white-space: nowrap;
  }
  
  .tab-button:hover {
    color: #3498db;
  }
  
  .tab-button.active {
    color: #3498db;
    border-bottom-color: #3498db;
  }
</style>