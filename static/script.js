// API base URL
const API_BASE = 'http://localhost:5000';

// Utility function to show results with smooth animations
function showResult(elementId, message, type = 'info') {
    const element = document.getElementById(elementId);
    
    // Fade out if already visible
    if (element.style.display !== 'none' && element.innerHTML) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            element.innerHTML = message;
            element.className = `result ${type}`;
            element.style.display = 'block';
            
            // Trigger reflow
            element.offsetHeight;
            
            // Fade in with new content
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 200);
    } else {
        element.innerHTML = message;
        element.className = `result ${type}`;
        element.style.display = 'block';
        element.style.opacity = '0';
        element.style.transform = 'translateY(10px)';
        
        // Trigger reflow
        element.offsetHeight;
        
        // Animate in
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 50);
    }
}

// Enhanced loading state for buttons
function setButtonLoading(button, isLoading, originalText) {
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = `<span class="loading"></span>${originalText}`;
        button.style.opacity = '0.8';
    } else {
        button.disabled = false;
        button.innerHTML = originalText;
        button.style.opacity = '1';
    }
}

// Animate form elements
function animateFormSubmission(formElement) {
    formElement.style.transform = 'scale(0.98)';
    formElement.style.transition = 'transform 0.2s ease';
    
    setTimeout(() => {
        formElement.style.transform = 'scale(1)';
    }, 200);
}

// Submit user slots data with enhanced UX
async function submitSlots() {
    const jsonInput = document.getElementById('jsonInput');
    const submitButton = window.event ? window.event.target : document.querySelector('button[onclick="submitSlots()"]');
    const originalText = submitButton.innerHTML;
    
    const jsonValue = jsonInput.value.trim();
    
    if (!jsonValue) {
        showResult('submitResult', '❌ Please enter JSON data', 'error');
        jsonInput.focus();
        jsonInput.style.borderColor = '#ff6b6b';
        setTimeout(() => {
            jsonInput.style.borderColor = '';
        }, 2000);
        return;
    }
    
    // Animate form
    animateFormSubmission(jsonInput.parentElement);
    setButtonLoading(submitButton, true, 'Submitting...');
    
    try {
        const data = JSON.parse(jsonValue);
        
        const response = await fetch('/slots', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showResult('submitResult', `✅ ${result.message}`, 'success');
            jsonInput.style.borderColor = '#00c851';
            updateDataStatus(`📊 ${data.users.length} users loaded`);
            setTimeout(() => {
                jsonInput.style.borderColor = '';
            }, 2000);
        } else {
            showResult('submitResult', `❌ Error: ${result.error}`, 'error');
            jsonInput.style.borderColor = '#ff6b6b';
            setTimeout(() => {
                jsonInput.style.borderColor = '';
            }, 2000);
        }
    } catch (error) {
        if (error instanceof SyntaxError) {
            showResult('submitResult', '❌ Invalid JSON format. Please check your input.', 'error');
            jsonInput.style.borderColor = '#ff6b6b';
            jsonInput.focus();
        } else {
            showResult('submitResult', `❌ Error: ${error.message}`, 'error');
        }
        setTimeout(() => {
            jsonInput.style.borderColor = '';
        }, 2000);
    } finally {
        setButtonLoading(submitButton, false, originalText);
    }
}

// Get meeting suggestions with enhanced UX
async function getSuggestions() {
    const duration = document.getElementById('duration').value;
    const suggestButton = window.event ? window.event.target : document.querySelector('button[onclick="getSuggestions()"]');
    const originalText = suggestButton.innerHTML;
    
    if (!duration || duration < 1) {
        showResult('submitResult', '❌ Please enter a valid duration', 'error');
        return;
    }
    
    setButtonLoading(suggestButton, true, 'Finding slots...');
    
    try {
        const response = await fetch(`/suggest?duration=${duration}`);
        const result = await response.json();
        
        if (response.ok) {
            displaySuggestions(result);
            if (result.length > 0) {
                showResult('submitResult', `✅ Found ${result.length} available time slot${result.length > 1 ? 's' : ''}`, 'success');
            } else {
                showResult('submitResult', '⚠️ No available time slots found for the requested duration', 'info');
            }
        } else {
            showResult('submitResult', `❌ Error: ${result.error}`, 'error');
            clearSuggestionsTable();
        }
    } catch (error) {
        showResult('submitResult', `❌ Error: ${error.message}`, 'error');
        clearSuggestionsTable();
    } finally {
        setButtonLoading(suggestButton, false, originalText);
    }
}

// Display suggestions in table with animations
function displaySuggestions(suggestions) {
    const tbody = document.querySelector('#suggestionsTable tbody');
    tbody.innerHTML = '';
    
    if (suggestions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #666; padding: 30px;">🚫 No available time slots found</td></tr>';
        return;
    }
    
    suggestions.forEach((slot, index) => {
        const row = document.createElement('tr');
        row.style.opacity = '0';
        row.style.transform = 'translateY(20px)';
        row.innerHTML = `
            <td style="font-weight: 600;">#${index + 1}</td>
            <td class="time-slot">🕐 ${slot[0]} - ${slot[1]}</td>
            <td>
                <button class="book-btn" onclick="bookMeeting('${slot[0]}', '${slot[1]}')">
                    📅 Book This Slot
                </button>
            </td>
        `;
        tbody.appendChild(row);
        
        // Animate in with delay
        setTimeout(() => {
            row.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            row.style.opacity = '1';
            row.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// Clear suggestions table with animation
function clearSuggestionsTable() {
    const tbody = document.querySelector('#suggestionsTable tbody');
    const rows = tbody.querySelectorAll('tr');
    
    rows.forEach((row, index) => {
        setTimeout(() => {
            row.style.opacity = '0';
            row.style.transform = 'translateY(-20px)';
        }, index * 50);
    });
    
    setTimeout(() => {
        tbody.innerHTML = '';
    }, rows.length * 50 + 200);
}

// Book a meeting slot with enhanced feedback
async function bookMeeting(startTime, endTime) {
    const bookButton = window.event ? window.event.target : document.querySelector(`button[onclick="bookMeeting('${startTime}', '${endTime}')"]`);
    const originalText = bookButton.innerHTML;
    
    setButtonLoading(bookButton, true, 'Booking...');
    
    try {
        const response = await fetch('/book', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                start: startTime,
                end: endTime
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showResult('submitResult', `🎉 Meeting booked successfully: ${startTime} - ${endTime}`, 'success');
            
            // Animate button success
            bookButton.innerHTML = '✅ Booked!';
            bookButton.style.background = 'linear-gradient(135deg, #00c851 0%, #00f093 100%)';
            bookButton.disabled = true;
            
            // Refresh suggestions to show updated availability
            setTimeout(() => {
                getSuggestions();
            }, 1000);
        } else {
            showResult('submitResult', `❌ Error booking meeting: ${result.error}`, 'error');
            setButtonLoading(bookButton, false, originalText);
        }
    } catch (error) {
        showResult('submitResult', `❌ Error: ${error.message}`, 'error');
        setButtonLoading(bookButton, false, originalText);
    }
}

// Get user calendar with enhanced UX
async function getCalendar() {
    const userId = document.getElementById('userId').value;
    const calendarButton = window.event ? window.event.target : document.querySelector('button[onclick="getCalendar()"]');
    const originalText = calendarButton.innerHTML;
    
    if (!userId) {
        showResult('calendarResult', '❌ Please enter a user ID', 'error');
        document.getElementById('userId').focus();
        return;
    }
    
    setButtonLoading(calendarButton, true, 'Loading calendar...');
    
    try {
        const response = await fetch(`/calendar/${userId}`);
        const result = await response.json();
        
        if (response.ok) {
            displayCalendar(result);
        } else {
            showResult('calendarResult', `❌ Error: ${result.error}`, 'error');
        }
    } catch (error) {
        showResult('calendarResult', `❌ Error: ${error.message}`, 'error');
    } finally {
        setButtonLoading(calendarButton, false, originalText);
    }
}

// Display user calendar with enhanced styling
function displayCalendar(calendarData) {
    let html = `<h4 style="color: #2c3e50; margin-bottom: 15px;">📅 Calendar for User ${calendarData.user_id}</h4>`;
    
    // Show busy slots
    if (calendarData.busy_slots && calendarData.busy_slots.length > 0) {
        html += `<h5 style="color: #e67e22; margin: 15px 0 10px 0;">🚫 Busy Times:</h5>`;
        calendarData.busy_slots.forEach(slot => {
            html += `<div class="calendar-item busy-slot">
                        <strong>🔒 Busy:</strong> ${slot[0]} - ${slot[1]}
                     </div>`;
        });
    }
    
    // Show booked meetings
    if (calendarData.booked_meetings && calendarData.booked_meetings.length > 0) {
        html += `<h5 style="color: #3498db; margin: 15px 0 10px 0;">📅 Booked Meetings:</h5>`;
        calendarData.booked_meetings.forEach(meeting => {
            html += `<div class="calendar-item booked-slot">
                        <strong>🤝 Meeting:</strong> ${meeting.start} - ${meeting.end}
                     </div>`;
        });
    }
    
    if (calendarData.busy_slots.length === 0 && calendarData.booked_meetings.length === 0) {
        html += `<div class="calendar-item" style="background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%); color: white;">
                    <strong>🎉 All Clear!</strong> No busy times or booked meetings
                 </div>`;
    }
    
    showResult('calendarResult', html, 'info');
}

// Reset all data with enhanced confirmation
async function resetData() {
    const resetButton = window.event ? window.event.target : document.querySelector('button[onclick="resetData()"]');
    const originalText = resetButton.innerHTML;
    
    if (!confirm('🗑️ Are you sure you want to reset all data?\n\nThis will clear:\n• All users\n• All booked meetings\n• All current data\n\nThis action cannot be undone.')) {
        return;
    }
    
    setButtonLoading(resetButton, true, 'Resetting...');
    
    try {
        const response = await fetch('/reset', {
            method: 'POST'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showResult('resetResult', `✅ ${result.message}`, 'success');
            updateDataStatus('📊 No data loaded');
            
            // Clear the form and results with animation
            const jsonInput = document.getElementById('jsonInput');
            jsonInput.style.transition = 'opacity 0.3s ease';
            jsonInput.style.opacity = '0.5';
            
            setTimeout(() => {
                loadExampleData();
                jsonInput.style.opacity = '1';
            }, 300);
            
            clearSuggestionsTable();
            
            // Hide other results
            document.getElementById('submitResult').style.display = 'none';
            document.getElementById('calendarResult').style.display = 'none';
        } else {
            showResult('resetResult', `❌ Error: ${result.error}`, 'error');
        }
    } catch (error) {
        showResult('resetResult', `❌ Error: ${error.message}`, 'error');
    } finally {
        setButtonLoading(resetButton, false, originalText);
    }
}

// Auto-populate example data with typewriter effect
function loadExampleData() {
    const exampleData = {
        "users": [
            { "id": 1, "busy": [["09:00","10:30"], ["13:00","14:00"]] },
            { "id": 2, "busy": [["11:00","12:00"], ["15:00","16:00"]] }
        ]
    };
    
    const jsonInput = document.getElementById('jsonInput');
    const jsonString = JSON.stringify(exampleData, null, 2);
    
    // Clear existing content
    jsonInput.value = '';
    
    // Typewriter effect
    let i = 0;
    function typeWriter() {
        if (i < jsonString.length) {
            jsonInput.value += jsonString.charAt(i);
            i++;
            setTimeout(typeWriter, 10);
        }
    }
    
    // Start typewriter effect after a short delay
    setTimeout(typeWriter, 300);
}

// Add smooth scrolling and focus management
function focusElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => element.focus(), 500);
    }
}

// Update data status when data changes
function updateDataStatus(message) {
    const statusElement = document.getElementById('dataStatus');
    if (statusElement) {
        statusElement.textContent = message;
    }
}

// Enhanced page load animations
document.addEventListener('DOMContentLoaded', function() {
    // Add staggered animation to sections
    const sections = document.querySelectorAll('.section');
    sections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            section.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }, 200 + index * 150);
    });
    
    // Load example data with delay
    setTimeout(() => {
        loadExampleData();
    }, 1000);
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'Enter':
                    e.preventDefault();
                    submitSlots();
                    break;
                case 's':
                    e.preventDefault();
                    getSuggestions();
                    break;
                case 'r':
                    e.preventDefault();
                    if (confirm('Reset all data?')) {
                        resetData();
                    }
                    break;
                case 'h':
                    e.preventDefault();
                    const tooltip = document.getElementById('helpTooltip');
                    if (tooltip) {
                        if (tooltip.style.display === 'none') {
                            tooltip.style.display = 'block';
                            setTimeout(() => {
                                tooltip.style.opacity = '1';
                                tooltip.style.transform = 'translateY(0)';
                            }, 10);
                        } else {
                            closeTooltip();
                        }
                    }
                    break;
            }
        }
    });
});// API base URL
const API_URL = '';

// Utility function to show results
function showResult(elementId, message, type = 'info') {
    const element = document.getElementById(elementId);
    element.innerHTML = message;
    element.className = `result ${type}`;
    element.style.display = 'block';
}

// Submit user slots data
async function submitSlots() {
    const jsonInput = document.getElementById('jsonInput').value.trim();
    
    if (!jsonInput) {
        showResult('submitResult', 'Please enter JSON data', 'error');
        return;
    }
    
    try {
        const data = JSON.parse(jsonInput);
        
        const response = await fetch('/slots', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showResult('submitResult', result.message, 'success');
        } else {
            showResult('submitResult', `Error: ${result.error}`, 'error');
        }
    } catch (error) {
        if (error instanceof SyntaxError) {
            showResult('submitResult', 'Invalid JSON format. Please check your input.', 'error');
        } else {
            showResult('submitResult', `Error: ${error.message}`, 'error');
        }
    }
}

// Get meeting suggestions
async function getSuggestions() {
    const duration = document.getElementById('duration').value;
    
    if (!duration || duration < 1) {
        showResult('submitResult', 'Please enter a valid duration', 'error');
        return;
    }
    
    try {
        const response = await fetch(`/suggest?duration=${duration}`);
        const result = await response.json();
        
        if (response.ok) {
            displaySuggestions(result);
        } else {
            showResult('submitResult', `Error: ${result.error}`, 'error');
            clearSuggestionsTable();
        }
    } catch (error) {
        showResult('submitResult', `Error: ${error.message}`, 'error');
        clearSuggestionsTable();
    }
}

// Display suggestions in table
function displaySuggestions(suggestions) {
    const tbody = document.querySelector('#suggestionsTable tbody');
    tbody.innerHTML = '';
    
    if (suggestions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #666;">No available time slots found</td></tr>';
        return;
    }
    
    suggestions.forEach((slot, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td class="time-slot">${slot[0]} - ${slot[1]}</td>
            <td>
                <button class="book-btn" onclick="bookMeeting('${slot[0]}', '${slot[1]}')">
                    Book This Slot
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Clear suggestions table
function clearSuggestionsTable() {
    const tbody = document.querySelector('#suggestionsTable tbody');
    tbody.innerHTML = '';
}

// Book a meeting slot
async function bookMeeting(startTime, endTime) {
    try {
        const response = await fetch('/book', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                start: startTime,
                end: endTime
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showResult('submitResult', `Meeting booked successfully: ${startTime} - ${endTime}`, 'success');
            // Refresh suggestions to show updated availability
            getSuggestions();
        } else {
            showResult('submitResult', `Error booking meeting: ${result.error}`, 'error');
        }
    } catch (error) {
        showResult('submitResult', `Error: ${error.message}`, 'error');
    }
}

// Get user calendar
async function getCalendar() {
    const userId = document.getElementById('userId').value;
    
    if (!userId) {
        showResult('calendarResult', 'Please enter a user ID', 'error');
        return;
    }
    
    try {
        const response = await fetch(`/calendar/${userId}`);
        const result = await response.json();
        
        if (response.ok) {
            displayCalendar(result);
        } else {
            showResult('calendarResult', `Error: ${result.error}`, 'error');
        }
    } catch (error) {
        showResult('calendarResult', `Error: ${error.message}`, 'error');
    }
}

// Display user calendar
function displayCalendar(calendarData) {
    let html = `<h4>Calendar for User ${calendarData.user_id}</h4>`;
    
    // Show busy slots
    if (calendarData.busy_slots && calendarData.busy_slots.length > 0) {
        html += `<h5>Busy Times:</h5>`;
        calendarData.busy_slots.forEach(slot => {
            html += `<div class="calendar-item busy-slot">
                        <strong>Busy:</strong> ${slot[0]} - ${slot[1]}
                     </div>`;
        });
    }
    
    // Show booked meetings
    if (calendarData.booked_meetings && calendarData.booked_meetings.length > 0) {
        html += `<h5>Booked Meetings:</h5>`;
        calendarData.booked_meetings.forEach(meeting => {
            html += `<div class="calendar-item booked-slot">
                        <strong>Meeting:</strong> ${meeting.start} - ${meeting.end}
                     </div>`;
        });
    }
    
    if (calendarData.busy_slots.length === 0 && calendarData.booked_meetings.length === 0) {
        html += `<div class="calendar-item">
                    <em>No busy times or booked meetings</em>
                 </div>`;
    }
    
    showResult('calendarResult', html, 'info');
}

// Reset all data
async function resetData() {
    if (!confirm('Are you sure you want to reset all data? This will clear all users and booked meetings.')) {
        return;
    }
    
    try {
        const response = await fetch('/reset', {
            method: 'POST'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showResult('resetResult', result.message, 'success');
            // Clear the form and results
            document.getElementById('jsonInput').value = '';
            clearSuggestionsTable();
            document.getElementById('submitResult').style.display = 'none';
            document.getElementById('calendarResult').style.display = 'none';
        } else {
            showResult('resetResult', `Error: ${result.error}`, 'error');
        }
    } catch (error) {
        showResult('resetResult', `Error: ${error.message}`, 'error');
    }
}

// Auto-populate example data
function loadExampleData() {
    const exampleData = {
        "users": [
            { "id": 1, "busy": [["09:00","10:30"], ["13:00","14:00"]] },
            { "id": 2, "busy": [["11:00","12:00"], ["15:00","16:00"]] }
        ]
    };
    
    document.getElementById('jsonInput').value = JSON.stringify(exampleData, null, 2);
}

// Load example data on page load
document.addEventListener('DOMContentLoaded', function() {
    loadExampleData();
});