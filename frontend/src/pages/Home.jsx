import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import '../styles.css';

const socket = io('http://localhost:3001');

const departments = [
  { id: 1, name: 'Computer Science' },
  { id: 2, name: 'Computer Engineering' },
  { id: 3, name: 'Information Technology' }
];

export default function Home() {
  const [activeTab, setActiveTab] = useState('department');
  const [formData, setFormData] = useState({
    type: 'student',
    firstName: '',
    lastName: '',
    department: departments[0].id
  });
  const [response, setResponse] = useState('');
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
      setResponse('Connected to server');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      setResponse('Disconnected from server');
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  const handleDepartmentRequest = () => {
    const payload = {
      type: formData.type,
      department: formData.department
    };

    socket.emit('request', {
      type: 'GET_DEPARTMENT_MEMBERS',
      payload
    }, (response) => {
      if (response.success) {
        if (Array.isArray(response.data)) {
          setResponse(
            response.data.map(item =>
              `${item.name} - ${item.email} (${item.department})`
            ).join('\n') || 'No members found'
          );
        } else {
          setResponse(response.data || 'No data found');
        }
      } else {
        setResponse(`Error: ${response.error}`);
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (activeTab === 'department') {
      handleDepartmentRequest();
      return;
    }

    if (!formData.lastName) {
      setResponse('Error: Last name is required');
      return;
    }

    const payload = {
      type: formData.type,
      lastName: formData.lastName,
      ...(formData.firstName && { firstName: formData.firstName }),
      ...(formData.department && { department: formData.department })
    };

    socket.emit('request', {
      type: `GET_${activeTab.toUpperCase()}`,
      payload
    }, (response) => {
      if (response.success) {
        setResponse(
          response.data.join('\n') || 'No records found'
        );
      } else {
        setResponse(`Error: ${response.error}`);
      }
    });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setResponse('');
  };

  return (
    <div className="app-container">
      <header>
        <h1>School Data Portal</h1>
        <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </header>

      <div className="tabs">
        <button className={activeTab === 'email' ? 'active' : ''} onClick={() => handleTabChange('email')}>Get Email</button>
        <button className={activeTab === 'phone' ? 'active' : ''} onClick={() => handleTabChange('phone')}>Get Phone</button>
        <button className={activeTab === 'department' ? 'active' : ''} onClick={() => handleTabChange('department')}>Department Members</button>
      </div>

      <form onSubmit={handleSubmit}>
        {activeTab !== 'department' && (
          <div className="form-group">
            <label>Search in:</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="student">Students</option>
              <option value="employee">Employees</option>
            </select>
          </div>
        )}

        <div className="form-group">
          <label>Department Id:</label>
          <select
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: parseInt(e.target.value) })}
          >
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.id}</option>
            ))}
          </select>
        </div>

        {activeTab !== 'department' && (
          <>
            <div className="form-group">
              <label>First Name (optional)</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Leave blank to search by last name only"
              />
            </div>
            <div className="form-group">
              <label>Last Name (required)</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </>
        )}

        <button type="submit" disabled={!isConnected}>
          {isConnected ? 'Submit Request' : 'Connecting...'}
        </button>
      </form>

      <div className="response-box">
        <h3>Server Response:</h3>
        <pre>{response}</pre>
      </div>
    </div>
  );
}