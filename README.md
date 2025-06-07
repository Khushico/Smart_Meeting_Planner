# Smart_Meeting_Planner
🗓️ Smart Meeting Planner
A Flask-based meeting scheduler with algorithmic time slot optimization for multi-user availability detection.

🛠️ Technical Overview
Architecture: RESTful API with server-side rendering and client-side DOM manipulation
Algorithm: Interval merging with O(n log n) complexity for conflict resolution
Storage: In-memory data structures with JSON serialization
Frontend: Vanilla JavaScript with asynchronous fetch operations

⚙️ Core Functionality
📊 Schedule Processing Engine
JSON Schema Validation - Recursive data structure parsing and validation

Time Interval Algorithms - Merge overlapping busy periods using sorted arrays

Conflict Detection - Binary search-based availability calculation

Memory Management - Efficient in-memory storage with garbage collection

🔍 Availability Algorithm
Input Processing - Parse HH:MM time strings to minute integers

Interval Sorting - Sort busy periods by start time for optimal merging

Gap Analysis - Calculate free time windows between merged intervals

Duration Filtering - Return slots matching minimum duration requirements

📡 API Architecture
HTTP Methods - RESTful endpoints with proper status codes

Request Validation - JSON schema enforcement with error handling

Response Formatting - Structured JSON with metadata

Error Propagation - Exception handling with client-friendly messages

🎨 Frontend Implementation
Event-Driven Architecture - DOM event listeners with callback functions

Asynchronous Operations - Promise-based HTTP requests with async/await

State Management - Client-side data persistence and UI synchronization

Responsive Grid System - CSS Grid and Flexbox for adaptive layouts
