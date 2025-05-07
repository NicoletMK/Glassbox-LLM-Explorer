# GlassBox LLM Explorer 🔍  
*A transparent interface for experimenting with OpenAI's API*

---

## 🏗️ **Project Structure**  
```text
glassbox-llm-explorer/
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── .env.example
│   └── venv/
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── index.js
│   └── package.json
└── README.md
```

---

## 💻 **Backend Implementation**  
**File:** `backend/app.py`  
```python
from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import os

app = Flask(__name__)
CORS(app)

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": data['message']}]
    )
    return jsonify(response.choices[0].message.content)

if __name__ == '__main__':
    app.run(port=5000)
```

**Dependencies:** `backend/requirements.txt`  
```text
flask==2.3.2
flask-cors==3.0.10
openai==0.27.8
python-dotenv==1.0.0
```

---

## 🖥️ **Frontend Implementation**  
**File:** `frontend/src/App.jsx`  
```jsx
import { useState } from 'react';
import ChatWindow from './components/ChatWindow';

export default function App() {
  const [messages, setMessages] = useState([]);
  
  const sendMessage = async (message) => {
    const response = await fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    const data = await response.json();
    setMessages([...messages, data]);
  };

  return <ChatWindow messages={messages} onSend={sendMessage} />;
}
```

**Dependencies:** `frontend/package.json`  
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1"
  }
}
```

---

## 🛠️ **Setup Guide**  

### **Backend Setup**  
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate    # Windows
pip install -r requirements.txt
flask run
```

### **Frontend Setup**  
```bash
cd frontend
npm install
npm start
```

---

## 🌐 **Deployment**  
**Production Build:**  
```bash
# Frontend
cd frontend
npm run build

# Backend (with Gunicorn)
cd ../backend
gunicorn -w 4 -b :5000 app:app
```

---

## 🔐 **Environment Configuration**  
**Backend:** `backend/.env`  
```ini
OPENAI_API_KEY=your_api_key_here
FLASK_ENV=production
```

**Frontend:** `frontend/.env`  
```ini
REACT_APP_API_URL=/api
```

---

## 📜 **License**  
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
