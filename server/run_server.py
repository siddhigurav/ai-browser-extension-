import sys
import os

# Add the current directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Now we can import the app
from app import app

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)