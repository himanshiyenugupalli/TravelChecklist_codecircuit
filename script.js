(() => {
  // Page elements
  const landingPage = document.getElementById('landing-page');
  const dashboardPage = document.getElementById('dashboard-page');
  const homePage = document.getElementById('home-page');
  const settingsPage = document.getElementById('settings-page');
  
  // Navigation elements
  const navDashboard = document.getElementById('nav-dashboard');
  const navSettings = document.getElementById('nav-settings');
  const signOutBtn = document.getElementById('btn-signout');
  const mainNav = document.getElementById('main-nav');
  const backToDashboardBtn = document.getElementById('back-to-dashboard');
  const currentChecklistNameEl = document.getElementById('current-checklist-name');

  // Debug panel elements
  const storageDebugPanel = document.getElementById('storage-debug-panel');
  const debugPanelContent = document.getElementById('debug-panel-content');
  const toggleDebugPanelBtn = document.getElementById('toggle-debug-panel');

  // Landing auth tabs and forms
  const tabSignIn = document.getElementById('tab-signin');
  const tabSignUp = document.getElementById('tab-signup');
  const formSignIn = document.getElementById('form-signin');
  const formSignUp = document.getElementById('form-signup');
  const switchToSignup = document.getElementById('switch-to-signup');
  const switchToSignin = document.getElementById('switch-to-signin');

  // Checklist variables
  const checklistContainer = document.getElementById('checklist-container');
  const checklistsContainer = document.getElementById('checklists-container');
  const noChecklistsMessage = document.getElementById('no-checklists-message');
  const filterCategorySelect = document.getElementById('filter-category');
  const searchInput = document.getElementById('search-items');
  const clearSearchBtn = document.getElementById('clear-search');
  const progressBar = document.getElementById('progress-bar');
  const progressText = document.getElementById('progress-text');

  // Forms
  const addItemForm = document.getElementById('add-item-form');
  const newItemNameInput = document.getElementById('new-item-name');
  const newItemCategorySelect = document.getElementById('new-item-category');
  const createChecklistForm = document.getElementById('create-checklist-form');
  const newChecklistNameInput = document.getElementById('new-checklist-name');

  // Settings variables
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  const clearDataBtn = document.getElementById('clear-data');

  // Default categories and items
  const categories = ['Clothes', 'Toiletries', 'Accessories', 'Documents', 'Electronics', 'Misc'];
  const defaultItems = [
    { id: 1, name: 'T-Shirts', category: 'Clothes', packed: false },
    { id: 2, name: 'Jeans', category: 'Clothes', packed: false },
    { id: 3, name: 'Toothbrush', category: 'Toiletries', packed: false },
    { id: 4, name: 'Passport', category: 'Documents', packed: false },
    { id: 5, name: 'Phone Charger', category: 'Electronics', packed: false },
    { id: 6, name: 'Sunglasses', category: 'Accessories', packed: false },
    { id: 7, name: 'Book', category: 'Misc', packed: false }
  ];
  
  // Current active checklist state
  let userChecklists = {};
  let currentChecklistName = '';
  let checklist = [];

  // Helper to save and load checklists data
  function saveChecklists() {
    localStorage.setItem('packingBuddyChecklists', JSON.stringify(userChecklists));
    console.log('All checklists saved to localStorage:', userChecklists);
    updateDebugPanel();
  }

  function loadChecklists() {
    const saved = localStorage.getItem('packingBuddyChecklists');
    if(saved) {
      try {
        userChecklists = JSON.parse(saved);
        console.log('Checklists loaded from localStorage:', userChecklists);
      } catch {
        userChecklists = {};
        console.log('Failed to parse localStorage data, reset to empty object');
      }
    } else {
      userChecklists = {};
      console.log('No checklists found in localStorage, initialized empty object');
    }

    // Display no checklists message if needed
    if(Object.keys(userChecklists).length === 0) {
      noChecklistsMessage.style.display = 'block';
    } else {
      noChecklistsMessage.style.display = 'none';
    }
  }

  // Display localStorage contents in the debug panel
  function updateDebugPanel() {
    if (!debugPanelContent) return;
    
    // Always update the panel content - removed collapsed check
    
    debugPanelContent.innerHTML = '';
    
    if (!currentChecklistName) {
      debugPanelContent.textContent = 'No checklist selected.';
      return;
    }
    
    const currentList = userChecklists[currentChecklistName];
    if (!currentList || currentList.length === 0) {
      debugPanelContent.textContent = `No items in checklist "${currentChecklistName}".`;
      return;
    }
    
    // Group items by category
    const itemsByCategory = {};
    currentList.forEach(item => {
      if (!itemsByCategory[item.category]) {
        itemsByCategory[item.category] = [];
      }
      itemsByCategory[item.category].push(item);
    });
    
    const fragment = document.createDocumentFragment();
    
    // Title with checklist info
    const titleEl = document.createElement('div');
    titleEl.className = 'storage-item-header';
    titleEl.textContent = `Current Checklist: "${currentChecklistName}" (${currentList.length} items)`;
    fragment.appendChild(titleEl);
    
    // Categories
    Object.keys(itemsByCategory).sort().forEach(category => {
      const categoryItems = itemsByCategory[category];
      const packedItems = categoryItems.filter(i => i.packed).length;
      
      const categoryEl = document.createElement('div');
      categoryEl.className = 'storage-category';
      categoryEl.textContent = `${category} (${packedItems}/${categoryItems.length})`;
      fragment.appendChild(categoryEl);
      
      const itemsList = document.createElement('ul');
      itemsList.className = 'storage-item-list';
      
      categoryItems.forEach(item => {
        const itemEl = document.createElement('li');
        itemEl.className = 'storage-item-entry';
        itemEl.setAttribute('data-id', item.id);
        
        const statusEl = document.createElement('span');
        statusEl.textContent = item.packed ? '✓' : '○';
        statusEl.className = item.packed ? 'storage-item-packed' : 'storage-item-unpacked';
        itemEl.appendChild(statusEl);
        
        const nameEl = document.createElement('span');
        nameEl.textContent = item.name;
        if (item.packed) {
          nameEl.className = 'storage-item-packed';
        }
        itemEl.appendChild(nameEl);
        
        itemsList.appendChild(itemEl);
      });
      
      fragment.appendChild(itemsList);
    });
    
    debugPanelContent.appendChild(fragment);
  }

  // Save the current active checklist
  function saveChecklist() {
    if(currentChecklistName) {
      // Ensure we're storing a deep copy to prevent reference issues
      userChecklists[currentChecklistName] = JSON.parse(JSON.stringify(checklist));
      saveChecklists();
      console.log(`Checklist "${currentChecklistName}" saved with ${checklist.length} items`);
    }
  }

  // Load a specific checklist
  function loadChecklist(checklistName) {
    currentChecklistName = checklistName;
    currentChecklistNameEl.textContent = checklistName;
    
    if(userChecklists[checklistName]) {
      // Create a deep copy of the checklist from localStorage
      checklist = JSON.parse(JSON.stringify(userChecklists[checklistName]));
      console.log(`Loaded checklist "${checklistName}" with ${checklist.length} items`);
      validateChecklistData();
    } else {
      checklist = [...defaultItems];
      userChecklists[checklistName] = [...defaultItems];
      saveChecklists();
      console.log(`Created new checklist "${checklistName}" with default items`);
    }
    
    // Update debug panel with the loaded checklist
    updateDebugPanel();
  }

  // Validate checklist data structure to ensure it's correct
  function validateChecklistData() {
    console.log("Validating checklist data...");
    
    if (!Array.isArray(checklist)) {
      console.error("Checklist is not an array!", checklist);
      checklist = [];
      return false;
    }
    
    if (checklist.length === 0) {
      console.log("Checklist is empty");
      return true;
    }
    
    // Check that each item has the required properties
    const validItems = checklist.filter(item => {
      if (!item || typeof item !== 'object') {
        console.error("Invalid item (not an object):", item);
        return false;
      }
      
      const hasRequiredProps = item.hasOwnProperty('id') && 
                               item.hasOwnProperty('name') && 
                               item.hasOwnProperty('category') && 
                               item.hasOwnProperty('packed');
      
      if (!hasRequiredProps) {
        console.error("Item missing required properties:", item);
        return false;
      }
      
      return true;
    });
    
    if (validItems.length !== checklist.length) {
      console.warn(`Found ${checklist.length - validItems.length} invalid items in the checklist`);
      checklist = validItems;
    }
    
    // Group by category for debugging
    const itemsByCategory = {};
    checklist.forEach(item => {
      if (!itemsByCategory[item.category]) {
        itemsByCategory[item.category] = [];
      }
      itemsByCategory[item.category].push(item);
    });
    
    console.log("Checklist contents by category:", itemsByCategory);
    return true;
  }

  // Generate new item ID
  function generateId() {
    return checklist.length ? Math.max(...checklist.map(i => i.id)) + 1 : 1;
  }

  // Create a new checklist card element
  function createChecklistCardElement(checklistName) {
    const items = userChecklists[checklistName] || [];
    const totalItems = items.length;
    const packedItems = items.filter(item => item.packed).length;
    const percentComplete = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;
    
    const card = document.createElement('div');
    card.className = 'checklist-card';
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Open ${checklistName} checklist with ${totalItems} items, ${percentComplete}% packed`);
    
    // Generate item preview HTML
    let itemsPreviewHTML = '';
    
    // If there are items, create a preview
    if (items.length > 0) {
      // Group items by category
      const itemsByCategory = {};
      
      items.forEach(item => {
        if (!itemsByCategory[item.category]) {
          itemsByCategory[item.category] = [];
        }
        itemsByCategory[item.category].push(item);
      });
      
      // Create preview list
      itemsPreviewHTML = '<div class="items-preview">';
      
      // Get categories and sort them
      const categories = Object.keys(itemsByCategory).sort();
      
      // Show up to 3 categories
      const displayCategories = categories.slice(0, 3);
      
      displayCategories.forEach(category => {
        const categoryItems = itemsByCategory[category];
        const categoryItemCount = categoryItems.length;
        const packedCategoryItems = categoryItems.filter(item => item.packed).length;
        
        itemsPreviewHTML += `
          <div class="preview-category">
            <span class="preview-category-name">${category}</span>
            <div class="preview-category-stats">${packedCategoryItems}/${categoryItemCount}</div>
            <div class="preview-items">`;
        
        // Show up to 3 items per category
        const displayItems = categoryItems.slice(0, 3);
        
        displayItems.forEach(item => {
          itemsPreviewHTML += `
            <div class="preview-item ${item.packed ? 'packed' : ''}">
              <span class="preview-item-check">${item.packed ? '✓' : '○'}</span>
              <span class="preview-item-name">${item.name}</span>
            </div>`;
        });
        
        // If there are more items not shown
        if (categoryItemCount > 3) {
          itemsPreviewHTML += `<div class="preview-more">+${categoryItemCount - 3} more</div>`;
        }
        
        itemsPreviewHTML += '</div></div>';
      });
      
      // If there are more categories not shown
      if (categories.length > 3) {
        itemsPreviewHTML += `<div class="preview-more-categories">+${categories.length - 3} more categories</div>`;
      }
      
      itemsPreviewHTML += '</div>';
    } else {
      itemsPreviewHTML = '<div class="items-preview empty">No items added yet</div>';
    }
    
    const cardContent = `
      <h3>${checklistName}</h3>
      ${itemsPreviewHTML}
      <div class="checklist-meta">
        <span>${totalItems} items</span>
        <span>${percentComplete}% packed</span>
      </div>
      <div class="checklist-action-buttons">
        <button class="btn-sm btn-secondary duplicate-checklist" data-checklist="${checklistName}" title="Duplicate this checklist">Copy</button>
        <button class="btn-sm btn-danger delete-checklist" data-checklist="${checklistName}" title="Delete this checklist">Delete</button>
      </div>
    `;
    
    card.innerHTML = cardContent;
    
    // Open checklist when clicking the card
    card.addEventListener('click', (e) => {
      if(!e.target.classList.contains('delete-checklist') && !e.target.classList.contains('duplicate-checklist')) {
        openChecklist(checklistName);
      }
    });
    
    // Add keyboard accessibility
    card.addEventListener('keydown', (e) => {
      if(e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openChecklist(checklistName);
      }
    });
    
    // Delete button click handler
    const deleteBtn = card.querySelector('.delete-checklist');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if(confirm(`Are you sure you want to delete the "${checklistName}" checklist?`)) {
        delete userChecklists[checklistName];
        saveChecklists();
        renderChecklistCards();
      }
    });
    
    // Duplicate button click handler
    const duplicateBtn = card.querySelector('.duplicate-checklist');
    duplicateBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      duplicateChecklist(checklistName);
    });
    
    return card;
  }

  // Render all checklist cards on the dashboard
  function renderChecklistCards() {
    checklistsContainer.innerHTML = '';
    
    const checklistNames = Object.keys(userChecklists);
    
    if(checklistNames.length === 0) {
      noChecklistsMessage.style.display = 'block';
      return;
    }
    
    noChecklistsMessage.style.display = 'none';
    
    checklistNames.forEach(name => {
      const card = createChecklistCardElement(name);
      checklistsContainer.appendChild(card);
    });
  }

  // Open a specific checklist
  function openChecklist(checklistName) {
    loadChecklist(checklistName);
    console.log(`Opening checklist "${checklistName}" with ${checklist.length} items:`, checklist);
    renderChecklist();
    
    // If debug panel is visible, update it
    if (debugPanelContent && !debugPanelContent.classList.contains('collapsed')) {
      updateDebugPanel();
    }
    
    showPage('home');
  }

  // Render checklist items
  function renderChecklist() {
    console.log("Rendering checklist with items:", checklist);
    
    // If checklist is empty, show a helpful message
    if (!checklist || checklist.length === 0) {
      checklistContainer.innerHTML = '<p style="text-align:center; color:var(--accent-orange); margin-top:3rem; font-weight:700;">No items in this checklist yet. Add an item below to get started.</p>';
      updateProgress();
      updateDebugPanel();
      return;
    }

    const filter = filterCategorySelect.value;
    const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';
    
    // Apply filters - category and search term
    let filteredItems = checklist;
    if(filter !== 'all') {
      filteredItems = filteredItems.filter(i => i.category === filter);
    }
    if(searchTerm) {
      filteredItems = filteredItems.filter(i => 
        i.name.toLowerCase().includes(searchTerm) || 
        i.category.toLowerCase().includes(searchTerm)
      );
      // Highlight search by displaying the search term count
      if(searchInput) {
        const searchCount = filteredItems.length;
        const totalCount = checklist.length;
        searchInput.setAttribute('title', `Found ${searchCount} of ${totalCount} items`);
      }
    } else if(searchInput) {
      searchInput.removeAttribute('title');
    }
    
    const categoriesPresent = [...new Set(filteredItems.map(i => i.category))];
    checklistContainer.innerHTML = '';
    
    if(categoriesPresent.length === 0) {
      let message = 'No items to display.';
      if(searchTerm) {
        message = `No items matching "${searchTerm}"`;
      }
      checklistContainer.innerHTML = `<p style="text-align:center; color:var(--accent-orange); margin-top:3rem; font-weight:700;">${message}</p>`;
      updateProgress();
      updateDebugPanel();
      return;
    }

    console.log(`Displaying ${filteredItems.length} items across ${categoriesPresent.length} categories`);

    // Sort categories alphabetically for consistent display
    categoriesPresent.sort().forEach(category => {
      const card = document.createElement('section');
      card.className = 'category-card';
      card.setAttribute('aria-label', category + ' category checklist');
      card.setAttribute('data-category', category);
      const header = document.createElement('h3');
      header.className = 'category-header';
      header.textContent = category;
      card.appendChild(header);
      const ul = document.createElement('ul');
      ul.className = 'items-list';
      
      // Get items for this category
      const categoryItems = filteredItems.filter(i => i.category === category);
      console.log(`Category ${category}: ${categoryItems.length} items`);
      
      // Sort items: unpacked items first (newest first), then packed items
      const packedItems = categoryItems.filter(item => item.packed);
      const unpackedItems = categoryItems.filter(item => !item.packed);
      
      // Render unpacked items first
      unpackedItems.forEach(item => {
        const li = createItemElement(item, searchTerm);
        ul.appendChild(li);
      });
      
      // Then render packed items
      packedItems.forEach(item => {
        const li = createItemElement(item, searchTerm);
        ul.appendChild(li);
      });
      
      // Add category stats
      const categoryStats = document.createElement('div');
      categoryStats.className = 'category-stats';
      const totalCategoryItems = categoryItems.length;
      const packedCategoryItems = packedItems.length;
      const categoryProgress = totalCategoryItems > 0 ? Math.round((packedCategoryItems / totalCategoryItems) * 100) : 0;
      categoryStats.textContent = `${packedCategoryItems}/${totalCategoryItems} (${categoryProgress}%)`;
      header.appendChild(categoryStats);
      
      card.appendChild(ul);
      checklistContainer.appendChild(card);
    });
    
    updateProgress();
    updateDebugPanel();
  }

  // Helper function to create an item element with optional search term highlighting
  function createItemElement(item, searchTerm = '') {
    const li = document.createElement('li');
    li.setAttribute('data-id', item.id);
    li.className = item.packed ? 'item packed' : 'item unpacked';
    
    const label = document.createElement('label');
    label.className = 'checkbox-label';
    label.setAttribute('for', 'check-'+item.id);
    
    // If search term exists, highlight the matching part
    if (searchTerm && item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
      const itemName = item.name;
      const lowerName = itemName.toLowerCase();
      const start = lowerName.indexOf(searchTerm.toLowerCase());
      const end = start + searchTerm.length;
      
      const beforeMatch = itemName.substring(0, start);
      const match = itemName.substring(start, end);
      const afterMatch = itemName.substring(end);
      
      label.innerHTML = `${beforeMatch}<span class="highlight">${match}</span>${afterMatch}`;
    } else {
      label.textContent = item.name;
    }
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'check-'+item.id;
    checkbox.checked = item.packed;
    checkbox.setAttribute('aria-checked', checkbox.checked);
    checkbox.addEventListener('change', () => {
      console.log(`Item ${item.id} "${item.name}" changed to ${checkbox.checked ? 'packed' : 'unpacked'}`);
      updateItemPacked(item.id, checkbox.checked);
      
      // Visual feedback before re-render
      li.className = checkbox.checked ? 'item packed' : 'item unpacked';
      label.style.color = checkbox.checked ? 'var(--accent-green)' : 'var(--text-primary)';
      
      // Re-render the checklist to reorder items when checkbox state changes
      renderChecklist();
    });
    
    const checkmark = document.createElement('span');
    checkmark.className = 'checkmark';

    label.prepend(checkbox);
    label.appendChild(checkmark);

    li.appendChild(label);
    
    // Add item action buttons container
    const actionButtons = document.createElement('div');
    actionButtons.className = 'item-actions';
    
    // Edit button
    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'btn-item-edit';
    editBtn.title = 'Edit item';
    editBtn.innerHTML = '✎';
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      editItem(item.id);
    });
    
    // Remove button
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn-item-remove';
    removeBtn.title = 'Remove item';
    removeBtn.innerHTML = '✕';
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      removeItem(item.id);
    });
    
    // Add the buttons to the action container
    actionButtons.appendChild(editBtn);
    actionButtons.appendChild(removeBtn);
    
    // Add the action buttons to the list item
    li.appendChild(actionButtons);
    
    return li;
  }

  // Update packed state for item
  function updateItemPacked(id, packed) {
    const item = checklist.find(i => i.id === id);
    if(item) {
      item.packed = packed;
      saveChecklist();
      updateProgress();
      updateDebugPanel();
    }
  }

  // Remove an item from the checklist
  function removeItem(id) {
    if(confirm('Are you sure you want to remove this item?')) {
      const index = checklist.findIndex(i => i.id === id);
      if(index !== -1) {
        // Get item name for feedback
        const itemName = checklist[index].name;
        
        // Remove the item from the array
        checklist.splice(index, 1);
        
        // Save and update UI
        saveChecklist();
        
        // Show feedback message
        const feedback = document.createElement('div');
        feedback.className = 'add-item-feedback';
        feedback.textContent = `Removed: ${itemName}`;
        feedback.style.backgroundColor = 'var(--accent-orange)';
        addItemForm.appendChild(feedback);
        
        // Remove feedback after animation
        setTimeout(() => {
          feedback.classList.add('fade-out');
          setTimeout(() => {
            if (feedback.parentNode) {
              feedback.parentNode.removeChild(feedback);
            }
          }, 500);
        }, 1500);
        
        // Re-render the checklist
        renderChecklist();
      }
    }
  }
  
  // Edit an item in the checklist
  function editItem(id) {
    const item = checklist.find(i => i.id === id);
    if(item) {
      // Prompt for new name
      const newName = prompt('Edit item name:', item.name);
      
      // If user didn't cancel and provided a non-empty name
      if(newName && newName.trim() !== '') {
        // Check if an item with this name already exists in the same category
        const exists = checklist.some(i => 
          i.id !== id && 
          i.name.toLowerCase() === newName.trim().toLowerCase() && 
          i.category === item.category
        );
        
        if(exists) {
          alert('An item with this name already exists in this category.');
          return;
        }
        
        // Store old name for feedback
        const oldName = item.name;
        
        // Update item name
        item.name = newName.trim();
        
        // Save and update UI
        saveChecklist();
        
        // Show feedback message
        const feedback = document.createElement('div');
        feedback.className = 'add-item-feedback';
        feedback.textContent = `Renamed: ${oldName} → ${newName.trim()}`;
        feedback.style.backgroundColor = 'var(--accent-blue)';
        addItemForm.appendChild(feedback);
        
        // Remove feedback after animation
        setTimeout(() => {
          feedback.classList.add('fade-out');
          setTimeout(() => {
            if (feedback.parentNode) {
              feedback.parentNode.removeChild(feedback);
            }
          }, 500);
        }, 1500);
        
        // Re-render the checklist
        renderChecklist();
      }
    }
  }

  // Update progress bar and text
  function updateProgress() {
    const total = checklist.length;
    if(total === 0) {
      progressBar.style.width = `0%`;
      progressBar.setAttribute('aria-valuenow', 0);
      progressText.textContent = 'Packed: 0%';
      return;
    }
    const packedCount = checklist.filter(i => i.packed).length;
    const percent = Math.round((packedCount / total) * 100);
    
    // Update progress bar
    progressBar.style.width = percent + '%';
    progressBar.setAttribute('aria-valuenow', percent);
    
    // Update text with detailed counts
    progressText.textContent = `Packed: ${packedCount}/${total} (${percent}%)`;
    
    // Set progress bar color based on completion
    if (percent < 25) {
      progressBar.style.backgroundColor = 'var(--accent-orange)';
    } else if (percent < 75) {
      progressBar.style.backgroundColor = 'var(--accent-blue)';
    } else {
      progressBar.style.backgroundColor = 'var(--accent-green)';
    }
  }

  // Navigation handlers
  function showPage(page) {
    landingPage.style.display = page === 'landing' ? 'flex' : 'none';
    dashboardPage.style.display = page === 'dashboard' ? 'block' : 'none';
    homePage.style.display = page === 'home' ? 'block' : 'none';
    settingsPage.style.display = page === 'settings' ? 'block' : 'none';
    
    // Show/hide debug panel based on active page
    if (storageDebugPanel) {
      storageDebugPanel.style.display = page === 'home' ? 'block' : 'none';
    }

    // Update navigation buttons
    if(page === 'landing') {
      navDashboard.style.display = 'none';
      navSettings.style.display = 'none';
      signOutBtn.style.display = 'none';
    } else {
      navDashboard.style.display = 'inline-block';
      navSettings.style.display = 'inline-block';
      
      // Update selected state
      navDashboard.setAttribute('aria-selected', page === 'dashboard' ? 'true' : 'false');
      navSettings.setAttribute('aria-selected', page === 'settings' ? 'true' : 'false');
      
      if(!mainNav.contains(signOutBtn)) mainNav.appendChild(signOutBtn);
      signOutBtn.style.display = 'inline-block';
    }
    
    // Always update debug panel when showing home page
    if (page === 'home') {
      updateDebugPanel();
    }
  }

  // Nav event listeners
  navDashboard.addEventListener('click', () => {
    showPage('dashboard');
  });
  
  navSettings.addEventListener('click', () => {
    showPage('settings');
  });

  backToDashboardBtn.addEventListener('click', () => {
    renderChecklistCards(); // Refresh the dashboard with latest data
    showPage('dashboard');
  });

  // Sign out handler
  signOutBtn.addEventListener('click', () => {
    localStorage.removeItem('packingBuddyAuth');
    showPage('landing');
  });

  // Landing page auth tabs toggle
  function activateTab(tab) {
    if(tab === 'signin') {
      tabSignIn.classList.add('active');
      tabSignUp.classList.remove('active');
      formSignIn.classList.add('active');
      formSignUp.classList.remove('active');
      tabSignIn.setAttribute('aria-selected', 'true');
      tabSignUp.setAttribute('aria-selected', 'false');
      tabSignIn.setAttribute('tabindex', '0');
      tabSignUp.setAttribute('tabindex', '-1');
      document.getElementById('signin-footer').setAttribute('aria-hidden', 'false');
      document.getElementById('signup-footer').setAttribute('aria-hidden', 'true');
      formSignIn.focus();
    } else {
      tabSignIn.classList.remove('active');
      tabSignUp.classList.add('active');
      formSignIn.classList.remove('active');
      formSignUp.classList.add('active');
      tabSignIn.setAttribute('aria-selected', 'false');
      tabSignUp.setAttribute('aria-selected', 'true');
      tabSignIn.setAttribute('tabindex', '-1');
      tabSignUp.setAttribute('tabindex', '0');
      document.getElementById('signin-footer').setAttribute('aria-hidden', 'true');
      document.getElementById('signup-footer').setAttribute('aria-hidden', 'false');
      formSignUp.focus();
    }
  }
  tabSignIn.addEventListener('click', () => activateTab('signin'));
  tabSignUp.addEventListener('click', () => activateTab('signup'));
  switchToSignup.addEventListener('click', () => activateTab('signup'));
  switchToSignin.addEventListener('click', () => activateTab('signin'));

  // Authentication forms handlers
  function mockSignIn(email, password) {
    return email.length > 0 && password.length > 0;
  }
  function mockSignUp(email, password, confirmPassword) {
    return email.length > 0 && password.length >= 6 && password === confirmPassword;
  }

  // Sign in handler - shows the dashboard after successful sign in
  formSignIn.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('landing-signin-email').value.trim();
    const password = document.getElementById('landing-signin-password').value;
    if(mockSignIn(email, password)) {
      localStorage.setItem('packingBuddyAuth', 'true');
      loadChecklists();
      renderChecklistCards();
      showPage('dashboard'); // Go to dashboard instead of directly to checklist
      formSignIn.reset();
    } else {
      alert('Please enter valid email and password.');
    }
  });

  // Sign up handler - prepares for sign in
  formSignUp.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('landing-signup-email').value.trim();
    const password = document.getElementById('landing-signup-password').value;
    const confirmPassword = document.getElementById('landing-signup-confirm-password').value;
    
    if (password !== confirmPassword) {
      alert('Passwords do not match. Please try again.');
      return;
    }
    
    if(mockSignUp(email, password, confirmPassword)) {
      alert('Account created successfully (mock). You can sign in now.');
      activateTab('signin');
      formSignUp.reset();
    } else {
      alert('Please enter a valid email and password (minimum 6 characters).');
    }
  });

  // Create a new checklist
  createChecklistForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = newChecklistNameInput.value.trim();
    
    if(!name) {
      alert('Please enter a name for your checklist.');
      return;
    }
    
    if(userChecklists[name]) {
      alert('A checklist with this name already exists.');
      return;
    }
    
    // Create the new checklist with default items
    userChecklists[name] = [...defaultItems];
    saveChecklists();
    
    // Clear form and render
    newChecklistNameInput.value = '';
    renderChecklistCards();
    
    // Optionally, open the new checklist directly
    if(confirm(`"${name}" checklist created! Would you like to open it now?`)) {
      openChecklist(name);
    }
  });

  // Add item form handling in checklist
  addItemForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = newItemNameInput.value.trim();
    const category = newItemCategorySelect.value;
    
    if (!name || !category) {
      alert('Please enter an item name and select a category.');
      return;
    }
    
    // Make sure we have a current checklist selected
    if (!currentChecklistName) {
      alert('No checklist is currently selected.');
      showPage('dashboard');
      return;
    }

    const exists = checklist.some(i => i.name.toLowerCase() === name.toLowerCase() && i.category === category);
    if (exists) {
      alert('This item already exists in the selected category!');
      newItemNameInput.focus();
      return;
    }
    
    const newItem = {
      id: generateId(),
      name,
      category,
      packed: false
    };
    
    console.log(`Adding new item to checklist "${currentChecklistName}":`, newItem);
    
    // Add the new item to the beginning of the checklist array so it appears at the top
    checklist.unshift(newItem);
    
    // Save to localStorage and update UI
    saveChecklist();
    
    // Flash feedback message
    const feedback = document.createElement('div');
    feedback.className = 'add-item-feedback';
    feedback.textContent = `Added: ${name} to ${category}`;
    addItemForm.appendChild(feedback);
    
    // Remove feedback after animation
    setTimeout(() => {
      feedback.classList.add('fade-out');
      setTimeout(() => {
        if (feedback.parentNode) {
          feedback.parentNode.removeChild(feedback);
        }
      }, 500);
    }, 1500);
    
    // Re-render the checklist to display the new item
    renderChecklist();
    
    // Update debug panel explicitly
    updateDebugPanel();
    
    // Reset form fields
    newItemNameInput.value = '';
    newItemCategorySelect.value = '';
    newItemNameInput.focus();
  });
  
  filterCategorySelect.addEventListener('change', () => renderChecklist());
  
  document.getElementById('reset-all').addEventListener('click', () => {
    if (currentChecklistName && checklist.length > 0) {
      if(confirm(`Are you sure you want to uncheck all items in "${currentChecklistName}"?`)) {
        checklist.forEach(item => item.packed = false);
        saveChecklist();
        renderChecklist();
      }
    } else {
      alert('No items to reset.');
    }
  });

  // Dark mode toggle and clear data
  darkModeToggle.addEventListener('change', () => {
    if(darkModeToggle.checked) {
      document.body.classList.add('dark');
      localStorage.setItem('packingBuddyDarkMode', 'true');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('packingBuddyDarkMode', 'false');
    }
  });
  
  clearDataBtn.addEventListener('click', () => {
    if(confirm('Are you sure you want to clear all your data? This will reset all your checklists and preferences.')) {
      localStorage.removeItem('packingBuddyChecklists');
      localStorage.removeItem('packingBuddyDarkMode');
      
      userChecklists = {};
      currentChecklistName = '';
      checklist = [];
      
      loadDarkModePref();
      renderChecklistCards();
      alert('All data cleared.');
      showPage('dashboard');
    }
  });

  // Load dark mode from preference
  function loadDarkModePref() {
    const scheme = localStorage.getItem('packingBuddyDarkMode');
    if(scheme === 'true') {
      document.body.classList.add('dark');
      darkModeToggle.checked = true;
    } else {
      document.body.classList.remove('dark');
      darkModeToggle.checked = false;
    }
  }

  // Function to duplicate a checklist
  function duplicateChecklist(sourceName) {
    let newName = `${sourceName} (Copy)`;
    let counter = 1;
    
    // Make sure the new name doesn't already exist
    while (userChecklists[newName]) {
      counter++;
      newName = `${sourceName} (Copy ${counter})`;
    }
    
    // Custom name input
    const customName = prompt(`Enter a name for the duplicate checklist:`, newName);
    
    if (!customName) return; // User canceled
    if (customName.trim() === '') {
      alert('Checklist name cannot be empty.');
      return;
    }
    if (userChecklists[customName.trim()]) {
      alert('A checklist with this name already exists.');
      return;
    }
    
    // Deep copy of the source checklist items, resetting the packed state
    const sourceItems = userChecklists[sourceName];
    const newItems = sourceItems.map(item => ({
      ...JSON.parse(JSON.stringify(item)),
      packed: false, // Reset packed state for the new checklist
    }));
    
    userChecklists[customName.trim()] = newItems;
    saveChecklists();
    renderChecklistCards();
    
    console.log(`Duplicated checklist "${sourceName}" to "${customName}" with ${newItems.length} items`);
  }

  // Initialize app
  function initializeApp() {
    const auth = localStorage.getItem('packingBuddyAuth') === 'true';
    loadDarkModePref();
    
    if(auth) {
      loadChecklists();
      renderChecklistCards();
      showPage('dashboard');
    } else {
      showPage('landing');
    }
  }

  // Search and filter handlers
  filterCategorySelect.addEventListener('change', () => renderChecklist());

  // Add these after all functions are defined, within the IIFE
  if (searchInput && clearSearchBtn) {
    // Initialize search functionality
    searchInput.addEventListener('input', () => {
      renderChecklist();
      // Show/hide clear button based on search input
      clearSearchBtn.style.display = searchInput.value ? 'flex' : 'none';
    });

    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      clearSearchBtn.style.display = 'none';
      renderChecklist();
      searchInput.focus();
    });

    // Hide clear button initially
    clearSearchBtn.style.display = 'none';
  }

  // Toggle debug panel visibility
  if (toggleDebugPanelBtn && debugPanelContent) {
    // Always expanded - remove collapsed class
    updateDebugPanel();
  }

  // Add listener for debug panel header - remove toggle functionality
  if (storageDebugPanel) {
    const debugHeader = storageDebugPanel.querySelector('.debug-panel-header');
    if (debugHeader) {
      // Remove click handler that toggles visibility
    }
  }

  initializeApp();
})(); 