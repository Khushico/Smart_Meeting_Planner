from flask import Flask, request, jsonify, render_template
from datetime import datetime, timedelta
import json

app = Flask(__name__)

# In-memory storage
users_data = {}
booked_meetings = []

def parse_time(time_str):
    """Parse time string to datetime object"""
    return datetime.strptime(time_str, "%H:%M").time()

def time_to_minutes(time_obj):
    """Convert time to minutes from midnight"""
    return time_obj.hour * 60 + time_obj.minute

def minutes_to_time(minutes):
    """Convert minutes from midnight to HH:MM format"""
    hours = minutes // 60
    mins = minutes % 60
    return f"{hours:02d}:{mins:02d}"

def get_all_busy_intervals():
    """Get all busy intervals including booked meetings"""
    all_intervals = []
    
    # Add user busy times
    for user_id, user_data in users_data.items():
        for interval in user_data.get('busy', []):
            all_intervals.append({
                'user_id': user_id,
                'start': interval[0],
                'end': interval[1],
                'type': 'busy'
            })
    
    # Add booked meetings
    for meeting in booked_meetings:
        for user_id in users_data.keys():
            all_intervals.append({
                'user_id': user_id,
                'start': meeting['start'],
                'end': meeting['end'],
                'type': 'booked'
            })
    
    return all_intervals

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/slots', methods=['POST'])
def post_slots():
    """Accept JSON list of users with their busy intervals"""
    try:
        data = request.get_json()
        
        if not data or 'users' not in data:
            return jsonify({'error': 'Invalid JSON format. Expected {"users": [...]}'}), 400
        
        # Clear existing data and store new users
        users_data.clear()
        
        for user in data['users']:
            if 'id' not in user:
                return jsonify({'error': 'Each user must have an id'}), 400
            
            user_id = user['id']
            busy_slots = user.get('busy', [])
            
            # Validate busy slots format
            for slot in busy_slots:
                if len(slot) != 2:
                    return jsonify({'error': 'Each busy slot must have start and end time'}), 400
                try:
                    parse_time(slot[0])
                    parse_time(slot[1])
                except ValueError:
                    return jsonify({'error': 'Invalid time format. Use HH:MM'}), 400
            
            users_data[user_id] = {
                'busy': busy_slots
            }
        
        return jsonify({'message': f'Successfully stored data for {len(users_data)} users'}), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/suggest')
def suggest_meeting():
    """Return first three time ranges where all users are free"""
    try:
        duration = int(request.args.get('duration', 30))
        
        if not users_data:
            return jsonify({'error': 'No user data available. Please POST to /slots first'}), 400
        
        # Working hours: 09:00-18:00 IST (540-1080 minutes)
        work_start = 9 * 60  # 540 minutes
        work_end = 18 * 60   # 1080 minutes
        
        # Collect all busy intervals for all users
        busy_intervals = []
        all_intervals = get_all_busy_intervals()
        
        for interval in all_intervals:
            start_minutes = time_to_minutes(parse_time(interval['start']))
            end_minutes = time_to_minutes(parse_time(interval['end']))
            busy_intervals.append((start_minutes, end_minutes))
        
        # Sort and merge overlapping intervals
        busy_intervals.sort()
        merged_intervals = []
        
        for start, end in busy_intervals:
            if merged_intervals and start <= merged_intervals[-1][1]:
                # Overlapping intervals, merge them
                merged_intervals[-1] = (merged_intervals[-1][0], max(merged_intervals[-1][1], end))
            else:
                merged_intervals.append((start, end))
        
        # Find free slots
        free_slots = []
        current_time = work_start
        
        for busy_start, busy_end in merged_intervals:
            # If there's a gap before this busy period
            if current_time < busy_start:
                if busy_start - current_time >= duration:
                    free_slots.append((current_time, busy_start))
            current_time = max(current_time, busy_end)
        
        # Check for free time after the last busy period
        if current_time < work_end and work_end - current_time >= duration:
            free_slots.append((current_time, work_end))
        
        # Convert to time ranges and limit to first 3
        suggestions = []
        for start_minutes, end_minutes in free_slots[:3]:
            start_time = minutes_to_time(start_minutes)
            # For suggestion, show the available window, not just the meeting duration
            end_time = minutes_to_time(min(start_minutes + duration, end_minutes))
            suggestions.append([start_time, end_time])
        
        return jsonify(suggestions)
        
    except ValueError:
        return jsonify({'error': 'Duration must be a valid integer'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/calendar/<int:user_id>')
def get_calendar(user_id):
    """Show user's busy slots plus booked meetings"""
    try:
        if user_id not in users_data:
            return jsonify({'error': 'User not found'}), 404
        
        calendar_data = {
            'user_id': user_id,
            'busy_slots': users_data[user_id]['busy'],
            'booked_meetings': [
                {'start': meeting['start'], 'end': meeting['end'], 'type': 'booked'}
                for meeting in booked_meetings
            ]
        }
        
        return jsonify(calendar_data)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/book', methods=['POST'])
def book_meeting():
    """Book a meeting slot (bonus feature)"""
    try:
        data = request.get_json()
        
        if not data or 'start' not in data or 'end' not in data:
            return jsonify({'error': 'Missing start or end time'}), 400
        
        start_time = data['start']
        end_time = data['end']
        
        # Validate time format
        try:
            parse_time(start_time)
            parse_time(end_time)
        except ValueError:
            return jsonify({'error': 'Invalid time format. Use HH:MM'}), 400
        
        # Add to booked meetings
        meeting = {
            'start': start_time,
            'end': end_time,
            'booked_at': datetime.now().isoformat()
        }
        booked_meetings.append(meeting)
        
        return jsonify({'message': 'Meeting booked successfully', 'meeting': meeting}), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/reset', methods=['POST'])
def reset_data():
    """Reset all data (utility endpoint for testing)"""
    users_data.clear()
    booked_meetings.clear()
    return jsonify({'message': 'All data cleared'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)