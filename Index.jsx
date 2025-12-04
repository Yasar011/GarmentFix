import React, { useState, useEffect, useMemo } from 'react';
import { 
  QrCode, ClipboardList, Wrench, LayoutDashboard, PlusCircle, AlertTriangle, 
  CheckCircle, Factory, Printer, ScanLine, Clock, PlayCircle, CheckSquare, 
  Building, History, X, Wifi, Database, Trash2, Loader2, User, LogOut, 
  Lock, MapPin, Briefcase, UserCheck, UserX, RefreshCw, Hand, Activity, 
  Settings, Package, BarChart2, AlertOctagon, CalendarClock, TrendingUp,
  ShoppingBag, MessageSquare, Camera
} from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, update, onValue, set, remove, get } from "firebase/database";

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyBUbE6WtnWnHQsCul_5bDDPHz78jlaHCxs",
  authDomain: "apparel-maintenance.firebaseapp.com",
  databaseURL: "https://apparel-maintenance-default-rtdb.firebaseio.com",
  projectId: "apparel-maintenance",
  storageBucket: "apparel-maintenance.firebasestorage.app",
  messagingSenderId: "716246308986",
  appId: "1:716246308986:web:0f5f33db9c65ffba1543c3",
  measurementId: "G-4G0694Q22Z"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- COMPONENTS ---

const LoadingOverlay = ({ message }) => (
  <div className="fixed inset-0 bg-slate-900/90 flex flex-col items-center justify-center z-[100] text-white backdrop-blur-sm">
    <Loader2 className="w-16 h-16 animate-spin text-blue-500 mb-4" />
    <h3 className="text-2xl font-bold">{message || "Processing..."}</h3>
  </div>
);

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 ${className}`}>
    {children}
  </div>
);

const Button = ({ onClick, children, variant = "primary", className = "", disabled = false, size = "md", fullWidth = false }) => {
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    danger: "bg-red-500 text-white hover:bg-red-600",
    success: "bg-green-600 text-white hover:bg-green-700",
    warning: "bg-yellow-500 text-white hover:bg-yellow-600",
    outline: "border border-slate-300 text-slate-600 hover:bg-slate-50"
  };
  const sizes = { sm: "px-2 py-1 text-xs", md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-base" };
  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

const Badge = ({ status, type = "status" }) => {
  const styles = {
    // Status
    Running: "bg-green-100 text-green-800 border-green-200",
    Pending: "bg-red-100 text-red-800 border-red-200 animate-pulse",
    "In Progress": "bg-yellow-100 text-yellow-800 border-yellow-200",
    Available: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Active: "bg-orange-100 text-orange-800 border-orange-200",
    Offline: "bg-slate-100 text-slate-500 border-slate-200",
    // Priority
    Low: "bg-blue-100 text-blue-800 border-blue-200",
    Normal: "bg-slate-100 text-slate-800 border-slate-200",
    Critical: "bg-red-600 text-white border-red-700 animate-pulse font-bold shadow-sm",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-bold border ${styles[status] || styles.Running}`}>
      {status}
    </span>
  );
};

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b flex justify-between items-center bg-slate-50 shrink-0">
          <h3 className="font-bold text-lg">{title}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-slate-500" /></button>
        </div>
        <div className="p-4 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- VIEWS ---

const LoginView = ({ onLogin, onReset, onOpenScanner, error }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password);
  };

  const handleReset = () => {
    if(confirm("EMERGENCY RESET: This will delete ALL users so you can start fresh. Are you sure?")) {
      onReset();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-white relative mb-4">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Factory className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">GarmentFix</h1>
          <p className="text-slate-500">Industrial Maintenance Platform</p>
        </div>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm font-bold border border-red-200">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <input 
              type="text" 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="admin"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="123"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <Button fullWidth size="lg">Sign In</Button>
        </form>
        <div className="mt-6 pt-4 border-t text-center text-xs text-slate-400">
          <p className="mb-2">Master Key: <strong>admin</strong> / <strong>123</strong></p>
          <button onClick={handleReset} className="text-red-400 hover:text-red-600 flex items-center gap-1 mx-auto mt-4">
            <Trash2 className="w-3 h-3" /> Emergency: Reset All Users
          </button>
        </div>
      </Card>

      {/* SCANNER BUTTON */}
      <button 
        onClick={onOpenScanner}
        className="w-full max-w-md bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-xl flex items-center justify-center gap-3 shadow-lg transition-transform hover:scale-[1.02]"
      >
        <div className="bg-white/20 p-2 rounded-full">
          <QrCode className="w-6 h-6" />
        </div>
        <div className="text-left">
          <div className="font-bold text-lg">Scan QR Code</div>
          <div className="text-xs text-blue-200">Report Breakdown (No Login)</div>
        </div>
      </button>
    </div>
  );
};

const KioskView = ({ machines, onReport, onClose }) => {
  const [selectedMachine, setSelectedMachine] = useState(null);
  
  // Form State
  const [issue, setIssue] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [opName, setOpName] = useState("");
  const [opId, setOpId] = useState("");

  const handleSubmit = () => {
    if(selectedMachine && issue && opName && opId) {
      onReport(selectedMachine.id, issue, priority, opName, opId);
      // Reset
      setSelectedMachine(null);
      setIssue("");
      setOpName("");
      setOpId("");
    } else {
      alert("Please fill in all fields (Issue, Name, ID)");
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md shrink-0">
        <h2 className="text-xl font-bold flex items-center gap-2"><ScanLine className="w-6 h-6 text-blue-400"/> Scan To Report</h2>
        <Button variant="secondary" onClick={onClose}><X className="w-4 h-4"/> Close</Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
        {!selectedMachine ? (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <p className="text-slate-500">Simulate scanning a machine by clicking one below:</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {machines.slice(0, 50).map(m => (
                <button 
                  key={m.id} 
                  onClick={() => setSelectedMachine(m)} 
                  className="p-4 bg-white border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all text-left group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <QrCode className="w-8 h-8 text-slate-300 group-hover:text-blue-500" />
                    <Badge status={m.status} />
                  </div>
                  <div className="font-bold text-lg text-slate-800">{m.name}</div>
                  <div className="text-xs text-slate-500">{m.type}</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-md mx-auto mt-10">
            <Card className="p-6 shadow-xl border-t-4 border-t-blue-600">
              <div className="flex justify-between items-start mb-6 border-b pb-4">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">{selectedMachine.name}</h3>
                  <p className="text-slate-500">{selectedMachine.type}</p>
                </div>
                <button onClick={() => setSelectedMachine(null)} className="text-sm text-blue-600 hover:underline">Change Machine</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">What is the problem?</label>
                  <textarea 
                    className="w-full p-3 border rounded-lg h-24 focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="e.g. Needle broken, Oil leaking..."
                    value={issue}
                    onChange={e => setIssue(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Priority Level</label>
                  <div className="flex gap-2">
                    {['Low', 'Normal', 'Critical'].map(p => (
                      <button 
                        key={p} 
                        onClick={() => setPriority(p)}
                        className={`flex-1 py-2 rounded text-sm font-bold border transition-colors ${priority === p 
                          ? (p === 'Critical' ? 'bg-red-600 text-white border-red-600' : 'bg-blue-600 text-white border-blue-600') 
                          : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Operator Name</label>
                    <input 
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                      placeholder="John Doe"
                      value={opName}
                      onChange={e => setOpName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Operator ID</label>
                    <input 
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                      placeholder="OP-123"
                      value={opId}
                      onChange={e => setOpId(e.target.value)}
                    />
                  </div>
                </div>

                <Button fullWidth size="lg" onClick={handleSubmit} disabled={!issue || !opName || !opId}>
                  Submit Report
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

// ... (Rest of components: InventoryManager, AnalyticsDashboard, LiveMonitor, FactoryManager, TechnicianTaskBoard, UserSetupView - kept same as before but ensured they are present)

// NEW: Inventory Manager
const InventoryManager = ({ parts, partRequests, onAddPart, onDeletePart, onUpdateStock, onResolveRequest }) => {
  const [newPart, setNewPart] = useState({ name: "", stock: 0, minStock: 5 });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-blue-50 border-blue-100">
          <h3 className="font-bold text-blue-900 mb-2">Total Parts</h3>
          <p className="text-3xl font-bold text-blue-600">{parts.length}</p>
        </Card>
        <Card className="p-6 bg-red-50 border-red-100">
          <h3 className="font-bold text-red-900 mb-2">Low Stock Alerts</h3>
          <p className="text-3xl font-bold text-red-600">{parts.filter(p => p.stock <= p.minStock).length}</p>
        </Card>
        <Card className="p-6 bg-orange-50 border-orange-100">
          <h3 className="font-bold text-orange-900 mb-2">Active Requests</h3>
          <p className="text-3xl font-bold text-orange-600">{partRequests.length}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ADD PART FORM */}
        <div className="space-y-6">
          <Card className="p-6 h-fit">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><PlusCircle className="w-5 h-5"/> Add Spare Part</h3>
            <div className="space-y-3">
              <input className="w-full p-2 border rounded" placeholder="Part Name (e.g. Needle #14)" value={newPart.name} onChange={e => setNewPart({...newPart, name: e.target.value})} />
              <input type="number" className="w-full p-2 border rounded" placeholder="Initial Stock" value={newPart.stock} onChange={e => setNewPart({...newPart, stock: parseInt(e.target.value) || 0})} />
              <input type="number" className="w-full p-2 border rounded" placeholder="Min Alert Level" value={newPart.minStock} onChange={e => setNewPart({...newPart, minStock: parseInt(e.target.value) || 0})} />
              <Button fullWidth onClick={() => { if(newPart.name) { onAddPart(newPart); setNewPart({name: "", stock: 0, minStock: 5}); }}}>Add to Inventory</Button>
            </div>
          </Card>

          {/* TECHNICIAN REQUESTS */}
          <Card className="p-6 h-fit border-t-4 border-t-orange-500">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><MessageSquare className="w-5 h-5"/> Technician Requests</h3>
            {partRequests.length === 0 ? (
              <p className="text-slate-400 italic text-sm">No pending requests.</p>
            ) : (
              <div className="space-y-3">
                {partRequests.map(req => (
                  <div key={req.id} className="bg-orange-50 p-3 rounded border border-orange-200 text-sm">
                    <div className="font-bold text-orange-900">{req.partName}</div>
                    <div className="text-xs text-orange-700 mb-2">Requested by: {req.techName}</div>
                    <Button size="sm" variant="outline" className="w-full" onClick={() => onResolveRequest(req.id)}>Mark Resolved</Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* INVENTORY LIST */}
        <Card className="p-6 lg:col-span-2">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Package className="w-5 h-5"/> Inventory List</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-3">Part Name</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Total Used</th>
                  <th className="p-3">Stock Level</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {parts.map(part => (
                  <tr key={part.id} className="border-b hover:bg-slate-50">
                    <td className="p-3 font-medium">{part.name}</td>
                    <td className="p-3">
                      {part.stock <= part.minStock ? 
                        <span className="text-red-600 font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Low</span> : 
                        <span className="text-green-600">OK</span>
                      }
                    </td>
                    <td className="p-3 text-center text-slate-500 font-medium">
                      {part.totalUsed || 0}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => onUpdateStock(part.id, -1)} className="w-6 h-6 rounded bg-slate-200 hover:bg-slate-300">-</button>
                        <span className={`w-8 text-center font-bold ${part.stock <= part.minStock ? 'text-red-600' : ''}`}>{part.stock}</span>
                        <button onClick={() => onUpdateStock(part.id, 1)} className="w-6 h-6 rounded bg-slate-200 hover:bg-slate-300">+</button>
                      </div>
                    </td>
                    <td className="p-3">
                      <button onClick={() => onDeletePart(part.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
                    </td>
                  </tr>
                ))}
                {parts.length === 0 && <tr><td colSpan="5" className="p-4 text-center text-slate-400">No parts in inventory.</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

const AnalyticsDashboard = ({ logs, machines, parts, floors, lines }) => {
  const totalFixes = logs.filter(l => l.action === 'Fixed').length;
  const partsUsedCount = logs.filter(l => l.partsUsed).reduce((acc, curr) => acc + curr.partsUsed.length, 0);
  const avgDowntime = totalFixes > 0 ? "45 mins" : "0 mins";

  const getMachineLocation = (machineId) => {
    const machine = machines.find(m => m.id === machineId);
    if (!machine) return "Unknown";
    const line = lines.find(l => l.id === machine.lineId);
    const floor = line ? floors.find(f => f.id === line.floorId) : null;
    return floor ? floor.name : "Unknown Floor";
  };

  const getMachineName = (machineId) => {
    const machine = machines.find(m => m.id === machineId);
    return machine ? machine.name : "Deleted Machine";
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-purple-50 border-purple-100 flex items-center justify-between">
          <div>
            <p className="text-purple-900 font-bold">Total Repairs</p>
            <h2 className="text-4xl font-bold text-purple-700">{totalFixes}</h2>
          </div>
          <CheckSquare className="w-10 h-10 text-purple-300" />
        </Card>
        <Card className="p-6 bg-orange-50 border-orange-100 flex items-center justify-between">
          <div>
            <p className="text-orange-900 font-bold">Parts Consumed</p>
            <h2 className="text-4xl font-bold text-orange-700">{partsUsedCount}</h2>
          </div>
          <Package className="w-10 h-10 text-orange-300" />
        </Card>
        <Card className="p-6 bg-blue-50 border-blue-100 flex items-center justify-between">
          <div>
            <p className="text-blue-900 font-bold">Avg Downtime</p>
            <h2 className="text-4xl font-bold text-blue-700">{avgDowntime}</h2>
          </div>
          <Clock className="w-10 h-10 text-blue-300" />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5"/> Recent Activity</h3>
          <div className="space-y-4 max-h-64 overflow-y-auto">
            {logs.slice().reverse().slice(0, 10).map((log, i) => (
              <div key={i} className="flex justify-between items-center text-sm border-b pb-2">
                <div>
                  <div className="font-bold text-slate-800 flex items-center gap-2">
                    {log.action} 
                    <span className="text-xs font-normal text-slate-500 bg-slate-100 px-1 rounded">{log.ticketId || '#NA'}</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {getMachineName(log.machineId)} <span className="text-slate-300 mx-1">|</span> {getMachineLocation(log.machineId)}
                  </div>
                  <div className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleString()}</div>
                </div>
                {log.details && <span className="bg-slate-100 px-2 py-1 rounded text-xs truncate max-w-[100px]">{log.details}</span>}
              </div>
            ))}
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><AlertOctagon className="w-5 h-5"/> Maintenance Alerts</h3>
          <div className="space-y-2">
             {machines.filter(m => m.lastMaintenance && (new Date() - new Date(m.lastMaintenance)) > 2592000000).length === 0 ? 
               <p className="text-slate-400 italic">No machines overdue for maintenance.</p> :
               machines.filter(m => m.lastMaintenance && (new Date() - new Date(m.lastMaintenance)) > 2592000000).map(m => (
                 <div key={m.id} className="flex justify-between items-center p-2 bg-red-50 text-red-700 rounded border border-red-100">
                   <span>{m.name}</span>
                   <span className="text-xs font-bold">Overdue PM</span>
                 </div>
               ))
             }
             {parts.filter(p => p.stock <= p.minStock).map(p => (
               <div key={p.id} className="flex justify-between items-center p-2 bg-orange-50 text-orange-700 rounded border border-orange-100">
                 <span>Low Stock: {p.name}</span>
                 <span className="text-xs font-bold">{p.stock} left</span>
               </div>
             ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

const LiveMonitor = ({ machines, users, onAssign }) => {
  const pendingMachines = machines.filter(m => m.status === "Pending");
  const availableTechs = users.filter(u => u.role === 'technician' && u.status === 'Available');
  const [assignModal, setAssignModal] = useState(null);
  const [selectedTech, setSelectedTech] = useState("");

  const handleAssign = () => {
    if(assignModal && selectedTech) {
      onAssign(assignModal.id, selectedTech);
      setAssignModal(null);
      setSelectedTech("");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-4 bg-slate-800 text-white border-slate-700">
        <h3 className="font-bold mb-3 flex items-center gap-2"><UserCheck className="w-4 h-4 text-emerald-400"/> Technician Status Board</h3>
        <div className="flex gap-4 overflow-x-auto pb-2">
           {users.filter(u => u.role === 'technician').length === 0 && <span className="text-slate-500 text-sm">No technicians found. Go to Admin Setup to generate users.</span>}
           {users.filter(u => u.role === 'technician').map(tech => (
             <div key={tech.id} className="bg-slate-700 p-2 rounded-lg min-w-[140px] flex flex-col items-center border border-slate-600">
               <div className="font-bold text-sm">{tech.name}</div>
               <div className="text-xs text-slate-400 mb-1">@{tech.username}</div>
               <Badge status={tech.status} />
               {tech.currentTask && <div className="mt-1 text-[10px] bg-slate-900 px-1 rounded text-orange-300">Busy on Task</div>}
             </div>
           ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4 border-l-4 border-l-red-500">
          <h3 className="font-bold text-lg text-red-700 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Pending Issues ({pendingMachines.length})
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {pendingMachines.length === 0 ? <p className="text-slate-400 italic">No pending issues.</p> : 
              pendingMachines.map(m => (
                <div key={m.id} className="flex justify-between items-center p-3 bg-red-50 rounded border border-red-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-slate-800">{m.name}</div>
                      {m.priority && <Badge status={m.priority} type="priority"/>}
                    </div>
                    <div className="text-xs text-red-600">{m.issue}</div>
                    <div className="text-[10px] text-slate-400 mt-1 font-mono">{m.ticketId}</div>
                    {m.assignedTo && <div className="text-[10px] text-slate-500">Assigned: {users.find(u=>u.id===m.assignedTo)?.name}</div>}
                    {m.reportedBy && <div className="text-[10px] text-blue-600 mt-1">Rep: {m.reportedBy}</div>}
                  </div>
                  {!m.assignedTo ? (
                    <Button size="sm" onClick={() => setAssignModal(m)}>Assign Tech</Button>
                  ) : (
                    <span className="text-xs bg-slate-100 px-2 py-1 rounded">Wait List</span>
                  )}
                </div>
              ))
            }
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-yellow-500">
          <h3 className="font-bold text-lg text-yellow-700 mb-4 flex items-center gap-2">
            <Wrench className="w-5 h-5" /> Active Repairs
          </h3>
           <div className="space-y-2 max-h-60 overflow-y-auto">
             {machines.filter(m => m.status === 'In Progress').map(m => (
               <div key={m.id} className="flex justify-between items-center p-3 bg-yellow-50 rounded border border-yellow-100">
                 <div>
                    <div className="font-bold text-slate-800">{m.name}</div>
                    <div className="text-xs text-slate-500">
                      Tech: {users.find(u => u.id === m.assignedTo)?.name || 'Unknown'}
                    </div>
                 </div>
                 <Badge status="In Progress" />
               </div>
             ))}
             {machines.filter(m => m.status === 'In Progress').length === 0 && <p className="text-slate-400 italic">No active repairs.</p>}
           </div>
        </Card>
      </div>

      <Modal isOpen={!!assignModal} onClose={() => setAssignModal(null)} title="Assign Technician">
        <div className="space-y-4">
          <p>Assigning a technician to <strong>{assignModal?.name}</strong> ({assignModal?.issue})</p>
          <div>
            <label className="block text-sm font-medium mb-2">Select Available Technician</label>
            <select 
              className="w-full p-2 border rounded"
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
            >
              <option value="">-- Choose Tech --</option>
              {availableTechs.map(t => (
                <option key={t.id} value={t.id}>{t.name} (Online)</option>
              ))}
            </select>
            {availableTechs.length === 0 && <p className="text-red-500 text-xs mt-1">No technicians are currently Available.</p>}
          </div>
          <Button fullWidth onClick={handleAssign} disabled={!selectedTech}>Confirm Assignment</Button>
        </div>
      </Modal>
    </div>
  );
};

const FactoryManager = ({ buildings, floorsMap, linesMap, machinesMap, onAddBuilding, onAddFloor, onAddLine, onAddMachine }) => {
  const [newBuilding, setNewBuilding] = useState("");
  const [newFloor, setNewFloor] = useState({ name: "", buildingId: "" });
  const [newLine, setNewLine] = useState({ name: "", floorId: "" });
  const [newMachine, setNewMachine] = useState({ name: "", type: "", year: "", lineId: "" });

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 h-fit border-t-4 border-t-blue-500">
          <h3 className="font-bold text-lg mb-4">Add Building</h3>
          <div className="space-y-3">
            <input className="w-full p-2 border rounded" placeholder="Name (e.g., Plant 1)" value={newBuilding} onChange={e => setNewBuilding(e.target.value)} />
            <Button onClick={() => { onAddBuilding(newBuilding); setNewBuilding(""); }} className="w-full">Add Building</Button>
          </div>
        </Card>

        <Card className="p-6 h-fit border-t-4 border-t-indigo-500">
          <h3 className="font-bold text-lg mb-4">Add Floor</h3>
          <div className="space-y-3">
            <select className="w-full p-2 border rounded" value={newFloor.buildingId} onChange={e => setNewFloor({...newFloor, buildingId: e.target.value})}>
              <option value="">Select Building</option>
              {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <input className="w-full p-2 border rounded" placeholder="Floor (e.g., 2nd Floor)" value={newFloor.name} onChange={e => setNewFloor({...newFloor, name: e.target.value})} />
            <Button onClick={() => { onAddFloor(newFloor); setNewFloor({name: "", buildingId: ""}); }} className="w-full">Add Floor</Button>
          </div>
        </Card>

        <Card className="p-6 h-fit border-t-4 border-t-purple-500">
          <h3 className="font-bold text-lg mb-4">Add Line</h3>
          <div className="space-y-3">
            <select className="w-full p-2 border rounded" value={newLine.floorId} onChange={e => setNewLine({...newLine, floorId: e.target.value})}>
              <option value="">Select Floor</option>
              {Object.keys(floorsMap).map(bId => (
                 <optgroup key={bId} label={buildings.find(b=>b.id===bId)?.name}>
                    {floorsMap[bId].map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                 </optgroup>
              ))}
            </select>
            <input className="w-full p-2 border rounded" placeholder="Line Name (e.g., Line A)" value={newLine.name} onChange={e => setNewLine({...newLine, name: e.target.value})} />
            <Button onClick={() => { onAddLine(newLine); setNewLine({name: "", floorId: ""}); }} className="w-full">Add Line</Button>
          </div>
        </Card>

        <Card className="p-6 h-fit border-t-4 border-t-pink-500">
          <h3 className="font-bold text-lg mb-4">Add Machine</h3>
          <div className="space-y-3">
            <select className="w-full p-2 border rounded" value={newMachine.lineId} onChange={e => setNewMachine({...newMachine, lineId: e.target.value})}>
              <option value="">Select Line</option>
              {Object.keys(linesMap).map(fId => (
                 linesMap[fId].map(l => <option key={l.id} value={l.id}>{l.name}</option>)
              ))}
            </select>
            <input className="w-full p-2 border rounded" placeholder="Machine ID" value={newMachine.name} onChange={e => setNewMachine({...newMachine, name: e.target.value})} />
            <Button onClick={() => { onAddMachine(newMachine); setNewMachine({name: "", type: "", year: "", lineId: ""}); }} className="w-full">Add Machine</Button>
          </div>
        </Card>
      </div>

      <h3 className="text-xl font-bold text-slate-800 border-t pt-8">Facility Overview</h3>
      <div className="space-y-8">
        {buildings.map(b => (
          <div key={b.id} className="border-2 border-slate-300 rounded-xl p-4 bg-slate-50">
             <h4 className="font-bold text-xl text-slate-800 flex items-center gap-2 mb-4 bg-white p-3 rounded shadow-sm inline-block">
              <Building className="w-6 h-6 text-blue-600" /> {b.name}
            </h4>
            <div className="pl-4 border-l-2 border-slate-300 space-y-6">
              {(floorsMap[b.id] || []).map(floor => (
                <div key={floor.id}>
                  <h5 className="font-bold text-lg text-slate-600 flex items-center gap-2 mb-3">
                    <LayoutDashboard className="w-4 h-4" /> {floor.name}
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(linesMap[floor.id] || []).map(line => {
                      const lineMachines = machinesMap[line.id] || [];
                      return (
                        <Card key={line.id} className="p-4">
                          <div className="flex justify-between items-center mb-3">
                            <h5 className="font-bold text-slate-800">{line.name}</h5>
                            <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded">
                              {lineMachines.length} M/C
                            </span>
                          </div>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {lineMachines.map(machine => (
                                <div key={machine.id} className="flex justify-between items-center p-2 bg-white rounded border text-sm shadow-sm">
                                  <span className="font-medium truncate w-24">{machine.name}</span>
                                  <div className="flex items-center gap-2">
                                    {machine.status === "Pending" && <AlertTriangle className="w-4 h-4 text-red-500" />}
                                    {machine.status === "In Progress" && <Wrench className="w-4 h-4 text-yellow-500" />}
                                    <div className={`w-3 h-3 rounded-full ${machine.status === 'Running' ? 'bg-green-500' : machine.status === 'Pending' ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TechnicianTaskBoard = ({ currentUser, machines, parts, onScanStart, onComplete, onSelfAssign, onRequestPart }) => {
  const priorityOrder = { "Critical": 0, "Normal": 1, "Low": 2 };
  
  const myTasks = machines
    .filter(m => m.assignedTo === currentUser.id && m.status === 'Pending')
    .sort((a, b) => (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1));

  const activeTask = machines.find(m => m.assignedTo === currentUser.id && m.status === 'In Progress');
  const unassignedTasks = machines.filter(m => !m.assignedTo && m.status === 'Pending');
  
  const [remarks, setRemarks] = useState("");
  const [selectedParts, setSelectedParts] = useState([]);
  const [requestPartName, setRequestPartName] = useState("");
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  const togglePart = (partId) => {
    if(selectedParts.includes(partId)) {
      setSelectedParts(selectedParts.filter(id => id !== partId));
    } else {
      setSelectedParts([...selectedParts, partId]);
    }
  };

  const handleSendRequest = () => {
    if(activeTask && requestPartName) {
      onRequestPart(activeTask.id, requestPartName);
      setRequestPartName("");
      setIsRequestModalOpen(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-20">
      <div className="bg-slate-800 text-white p-6 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold mb-1">Hello, {currentUser.name}</h2>
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <Badge status={currentUser.status} />
          <span>ID: {currentUser.username}</span>
        </div>
      </div>

      {activeTask && (
        <Card className="p-6 border-l-4 border-l-orange-500 bg-orange-50">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-xl text-orange-800 flex items-center gap-2">
                <Wrench className="w-5 h-5"/> Work In Progress
              </h3>
              <p className="text-slate-600">{activeTask.name} - {activeTask.issue}</p>
              <div className="text-xs text-orange-400 mt-1 font-mono">{activeTask.ticketId}</div>
            </div>
            <div className="animate-pulse bg-orange-200 text-orange-800 px-3 py-1 rounded text-xs font-bold">TIMER ACTIVE</div>
          </div>
          
          <div className="space-y-4">
            <textarea 
              className="w-full p-3 border rounded h-24 bg-white" 
              placeholder="Describe repairs made..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
            
            {/* Parts Consumer */}
            <div className="bg-white p-3 rounded border">
              <p className="font-bold text-sm mb-2 text-slate-700">Parts Used (Tap to select)</p>
              <div className="flex flex-wrap gap-2">
                {parts.map(part => (
                  <button 
                    key={part.id}
                    onClick={() => togglePart(part.id)}
                    className={`px-3 py-1 text-xs rounded border transition-colors ${selectedParts.includes(part.id) ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
                  >
                    {part.name}
                  </button>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t">
                <button onClick={() => setIsRequestModalOpen(true)} className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-1">
                  <ShoppingBag className="w-3 h-3" /> Need a special part? Request it.
                </button>
              </div>
            </div>

            <Button fullWidth variant="success" onClick={() => { onComplete(activeTask.id, remarks, selectedParts); setSelectedParts([]); setRemarks(""); }}>
              <CheckSquare className="w-4 h-4" /> Submit & Finish
            </Button>
          </div>
        </Card>
      )}

      {/* REQUEST PART MODAL */}
      <Modal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} title="Request Special Part">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Need a part that isn't in the list? Request it from the store.</p>
          <input 
            className="w-full p-2 border rounded" 
            placeholder="Part Name / Number"
            value={requestPartName}
            onChange={(e) => setRequestPartName(e.target.value)}
          />
          <Button fullWidth onClick={handleSendRequest}>Send Request</Button>
        </div>
      </Modal>

      {!activeTask && (
        <>
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-slate-700 flex items-center gap-2">
              <Briefcase className="w-5 h-5" /> Assigned Tasks
            </h3>
            {myTasks.length === 0 ? (
              <div className="p-4 text-center bg-slate-100 rounded-lg text-slate-500 border border-dashed border-slate-300 text-sm">
                No specific tasks assigned by admin.
              </div>
            ) : (
              myTasks.map(task => (
                <Card key={task.id} className="p-4 flex flex-col gap-3">
                  <div className="flex justify-between">
                    <div className="font-bold text-lg flex items-center gap-2">
                      {task.name}
                      {task.priority && <Badge status={task.priority} type="priority"/>}
                    </div>
                    <Badge status="Pending" />
                  </div>
                  <div className="bg-slate-50 p-2 rounded text-sm text-slate-600">
                    <span className="font-bold text-slate-800">Issue:</span> {task.issue}
                  </div>
                  <div className="bg-blue-50 p-2 rounded text-xs text-blue-700 flex items-center gap-1">
                     <MapPin className="w-3 h-3" /> {task.ticketId}
                  </div>
                  <Button fullWidth variant="warning" onClick={() => onScanStart(task.id)}>
                     <QrCode className="w-4 h-4" /> Scan QR to Start
                  </Button>
                </Card>
              ))
            )}
          </div>

          <div className="border-t border-slate-200 my-4"></div>

          <div className="space-y-4">
            <h3 className="font-bold text-lg text-slate-700 flex items-center gap-2">
              <Hand className="w-5 h-5" /> Open Job Pool (Self-Assign)
            </h3>
            {unassignedTasks.length === 0 ? (
              <div className="p-4 text-center bg-green-50 rounded-lg text-green-600 border border-green-200 text-sm">
                All clear! No unassigned breakdowns.
              </div>
            ) : (
              unassignedTasks.map(task => (
                <Card key={task.id} className="p-4 border-l-4 border-l-slate-300">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-slate-800">{task.name}</div>
                      <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded inline-block mt-1 mr-2">{task.issue}</div>
                      {task.priority === "Critical" && <Badge status="Critical" type="priority"/>}
                    </div>
                    <Button size="sm" variant="outline" onClick={() => onSelfAssign(task.id)}>
                      Claim Job
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

const UserSetupView = ({ onAddUser }) => {
  const [newUser, setNewUser] = useState({ name: "", username: "", password: "", role: "technician" });
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <User className="w-5 h-5" /> Create User Account
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <input className="border p-2 rounded" placeholder="Full Name" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
             <input className="border p-2 rounded" placeholder="Username" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <input className="border p-2 rounded" type="password" placeholder="Password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
             <select className="border p-2 rounded" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                <option value="technician">Technician</option>
                <option value="admin">Admin</option>
             </select>
          </div>
          <Button onClick={() => { onAddUser(newUser); setNewUser({ name: "", username: "", password: "", role: "technician" }); }}>Create User</Button>
        </div>
      </Card>
    </div>
  );
};

// --- MAIN APP ---

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('live_monitor');
  const [error, setError] = useState(null);
  const [loadingOverlay, setLoadingOverlay] = useState("");
  
  // Data State
  const [users, setUsers] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [lines, setLines] = useState([]);
  const [machines, setMachines] = useState([]);
  const [logs, setLogs] = useState([]);
  const [parts, setParts] = useState([]);
  const [partRequests, setPartRequests] = useState([]);

  // Load Data
  useEffect(() => {
    const refs = {
      users: ref(db, 'users'),
      buildings: ref(db, 'buildings'),
      floors: ref(db, 'floors'),
      lines: ref(db, 'lines'),
      machines: ref(db, 'machines'),
      logs: ref(db, 'logs'),
      parts: ref(db, 'parts'),
      partRequests: ref(db, 'partRequests')
    };

    onValue(refs.users, (s) => setUsers(s.val() ? Object.keys(s.val()).map(k => ({id: k, ...s.val()[k]})) : []));
    onValue(refs.buildings, (s) => setBuildings(s.val() ? Object.keys(s.val()).map(k => ({id: k, ...s.val()[k]})) : []));
    onValue(refs.floors, (s) => setFloors(s.val() ? Object.keys(s.val()).map(k => ({id: k, ...s.val()[k]})) : []));
    onValue(refs.lines, (s) => setLines(s.val() ? Object.keys(s.val()).map(k => ({id: k, ...s.val()[k]})) : []));
    onValue(refs.machines, (s) => setMachines(s.val() ? Object.keys(s.val()).map(k => ({id: k, ...s.val()[k]})) : []));
    onValue(refs.logs, (s) => setLogs(s.val() ? Object.keys(s.val()).map(k => ({id: k, ...s.val()[k]})) : []));
    onValue(refs.parts, (s) => setParts(s.val() ? Object.keys(s.val()).map(k => ({id: k, ...s.val()[k]})) : []));
    onValue(refs.partRequests, (s) => setPartRequests(s.val() ? Object.keys(s.val()).map(k => ({id: k, ...s.val()[k]})) : []));
  }, []);

  const floorsMap = useMemo(() => {
    const map = {}; floors.forEach(f => { if(!map[f.buildingId]) map[f.buildingId] = []; map[f.buildingId].push(f); }); return map;
  }, [floors]);
  const linesMap = useMemo(() => {
    const map = {}; lines.forEach(l => { if(!map[l.floorId]) map[l.floorId] = []; map[l.floorId].push(l); }); return map;
  }, [lines]);
  const machinesMap = useMemo(() => {
    const map = {}; machines.forEach(m => { if(!map[m.lineId]) map[m.lineId] = []; map[m.lineId].push(m); }); return map;
  }, [machines]);

  // --- ACTIONS ---

  const handleLogin = (username, password) => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      setError(null);
      if(user.role === 'technician') update(ref(db, `users/${user.id}`), { status: 'Available' });
    } 
    else if (username === 'admin' && password === '123') {
       setCurrentUser({ id: 'temp_admin', name: 'Super Admin', role: 'admin', username: 'admin' });
       setError(null);
    } 
    else setError("Invalid credentials. Try admin / 123");
  };

  const handleLogout = () => {
    if (currentUser && currentUser.role === 'technician') update(ref(db, `users/${currentUser.id}`), { status: 'Offline' });
    setCurrentUser(null);
  };

  const handleEmergencyReset = () => {
    remove(ref(db, 'users'));
    alert("Users deleted. Login with admin / 123.");
  };

  const handleAddUser = (userData) => {
    push(ref(db, 'users'), { ...userData, status: 'Offline', createdAt: new Date().toISOString() });
    alert("User created!");
  };

  const handleAddBuilding = (name) => { if(name) push(ref(db, 'buildings'), { name }); };
  const handleAddFloor = (data) => { if(data.name && data.buildingId) push(ref(db, 'floors'), data); };
  const handleAddLine = (data) => { if(data.name && data.floorId) push(ref(db, 'lines'), data); };
  const handleAddMachine = (data) => { if(data.name && data.lineId) push(ref(db, 'machines'), {...data, status: "Running", createdAt: new Date().toISOString()}); };

  const handleAssignTech = (machineId, techId) => {
    update(ref(db, `machines/${machineId}`), { assignedTo: techId });
  };

  const handleSelfAssign = (machineId) => {
    update(ref(db, `machines/${machineId}`), { assignedTo: currentUser.id });
  };

  const handleScanStart = (machineId) => {
    update(ref(db, `machines/${machineId}`), { status: 'In Progress' });
    update(ref(db, `users/${currentUser.id}`), { status: 'Active', currentTask: machineId });
    push(ref(db, 'logs'), { machineId, action: 'Started Work', userId: currentUser.id, timestamp: new Date().toISOString() });
  };

  const handleCompleteWork = (machineId, remarks, partsUsedIds = []) => {
    const machine = machines.find(m => m.id === machineId);
    update(ref(db, `machines/${machineId}`), { status: 'Running', assignedTo: null, issue: null, priority: null, ticketId: null, lastMaintenance: new Date().toISOString() });
    update(ref(db, `users/${currentUser.id}`), { status: 'Available', currentTask: null });
    
    // Deduct Stock & Update Usage
    partsUsedIds.forEach(partId => {
      const part = parts.find(p => p.id === partId);
      if(part) {
        update(ref(db, `parts/${partId}`), { 
          stock: (part.stock || 0) - 1,
          totalUsed: (part.totalUsed || 0) + 1 
        });
      }
    });

    const usedPartNames = partsUsedIds.map(id => parts.find(p => p.id === id)?.name).filter(Boolean);

    push(ref(db, 'logs'), { 
      machineId, 
      ticketId: machine?.ticketId,
      action: 'Fixed', 
      userId: currentUser.id, 
      details: remarks, 
      partsUsed: usedPartNames,
      timestamp: new Date().toISOString() 
    });
  };

  const handleTechStatusToggle = () => {
    const newStatus = currentUser.status === 'Available' ? 'Offline' : 'Available';
    update(ref(db, `users/${currentUser.id}`), { status: newStatus });
    setCurrentUser({...currentUser, status: newStatus});
  };

  const handleSeedData = async () => {
    if(!confirm("Generate 300 machines?")) return;
    setLoadingOverlay("Generating Factory...");
    const updates = {};
    const adminExists = users.some(u => u.role === 'admin');
    if (!adminExists) {
        const adminKey = push(ref(db, 'users')).key;
        updates[`/users/${adminKey}`] = { name: "System Admin", username: "admin", password: "123", role: "admin", status: "Offline" };
    }
    const techExists = users.some(u => u.username === 'tech1');
    if(!techExists) {
       const uKey1 = push(ref(db, 'users')).key;
       updates[`/users/${uKey1}`] = { name: "John Tech", username: "tech1", password: "123", role: "technician", status: "Offline" };
    }
    for (let b = 1; b <= 2; b++) { 
      const bKey = push(ref(db, 'buildings')).key;
      updates[`/buildings/${bKey}`] = { name: `Plant ${b}` };
      for (let f = 1; f <= 3; f++) {
        const fKey = push(ref(db, 'floors')).key;
        updates[`/floors/${fKey}`] = { name: `Floor ${f}`, buildingId: bKey };
        for (let l = 1; l <= 5; l++) {
          const lKey = push(ref(db, 'lines')).key;
          updates[`/lines/${lKey}`] = { name: `Line ${l}`, floorId: fKey };
          for (let m = 1; m <= 10; m++) {
            const mKey = push(ref(db, 'machines')).key;
            updates[`/machines/${mKey}`] = { 
              name: `MC-${b}-${f}-${l}-${m}`, type: "SNLS", lineId: lKey, status: "Running", createdAt: new Date().toISOString() 
            };
          }
        }
      }
      await update(ref(db), updates);
    }
    setLoadingOverlay("");
    alert("Data Generated!");
  };

  const handleReportIssue = (machineId, issue, priority, operatorName, operatorId) => {
    const ticketId = `#TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    update(ref(db, `machines/${machineId}`), { 
        status: "Pending", 
        issue: issue, 
        priority: priority, 
        ticketId: ticketId,
        reportedBy: `${operatorName} (${operatorId})` 
    });
    alert(`Issue Reported! Ticket: ${ticketId}`);
  };

  const handleAddPart = (part) => { push(ref(db, 'parts'), part); };
  const handleDeletePart = (id) => { remove(ref(db, `parts/${id}`)); };
  const handleUpdateStock = (id, change) => { 
    const part = parts.find(p => p.id === id);
    if(part) update(ref(db, `parts/${id}`), { stock: part.stock + change }); 
  };

  const handleRequestPart = (machineId, partName) => {
    push(ref(db, 'partRequests'), {
      techName: currentUser.name,
      techId: currentUser.id,
      machineId: machineId,
      partName: partName,
      status: 'Pending',
      timestamp: new Date().toISOString()
    });
    alert("Request Sent to Store!");
  };

  const handleResolveRequest = (reqId) => {
    remove(ref(db, `partRequests/${reqId}`));
  };

  // --- RENDER ---

  if (!currentUser) {
    return (
      <div className="bg-slate-50 min-h-screen">
         {activeTab === 'login' && (
            <LoginView 
                onLogin={handleLogin} 
                onReset={handleEmergencyReset} 
                onOpenScanner={() => setActiveTab('operator_kiosk')}
                error={error} 
            />
         )}
         
         {activeTab === 'operator_kiosk' && (
           <KioskView 
             machines={machines} 
             onReport={handleReportIssue} 
             onClose={() => setActiveTab('login')}
           />
         )}
         
         {activeTab !== 'login' && activeTab !== 'operator_kiosk' && (
             <div className="fixed inset-0 flex items-center justify-center bg-white">
                 <Button onClick={() => setActiveTab('login')}>Go to Login</Button>
             </div>
         )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex flex-col md:flex-row">
      {loadingOverlay && <LoadingOverlay message={loadingOverlay} />}
      
      {/* SIDEBAR */}
      <div className="w-full md:w-64 bg-slate-900 text-white p-4 flex flex-col shrink-0">
        <h1 className="text-xl font-bold mb-6 flex items-center gap-2"><Factory className="text-blue-400" /> GarmentFix</h1>
        
        <div className="mb-6 p-3 bg-slate-800 rounded-lg">
          <div className="text-xs text-slate-400 uppercase font-bold mb-1">Logged in as</div>
          <div className="font-bold truncate">{currentUser.name}</div>
          <div className="text-xs text-blue-300 capitalize">{currentUser.role}</div>
          
          {currentUser.role === 'technician' && (
            <div className="mt-3 pt-3 border-t border-slate-700 flex items-center justify-between">
               <span className="text-xs">Status:</span>
               <button onClick={handleTechStatusToggle} className={`text-xs px-2 py-1 rounded font-bold ${currentUser.status === 'Available' ? 'bg-emerald-500 text-white' : 'bg-slate-600 text-slate-300'}`}>
                 {currentUser.status}
               </button>
            </div>
          )}
        </div>

        <nav className="space-y-2 flex-1">
          {currentUser.role === 'admin' ? (
            <>
              <button onClick={() => setActiveTab('live_monitor')} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${activeTab === 'live_monitor' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
                <Activity className="w-5 h-5" /> Live Monitor
              </button>
              <button onClick={() => setActiveTab('factory_manager')} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${activeTab === 'factory_manager' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
                <LayoutDashboard className="w-5 h-5" /> Factory Manager
              </button>
              <button onClick={() => setActiveTab('inventory')} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${activeTab === 'inventory' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
                <Package className="w-5 h-5" /> Inventory
              </button>
              <button onClick={() => setActiveTab('analytics')} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${activeTab === 'analytics' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
                <BarChart2 className="w-5 h-5" /> Analytics
              </button>
              <button onClick={() => setActiveTab('user_setup')} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${activeTab === 'user_setup' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
                <User className="w-5 h-5" /> User Setup
              </button>
            </>
          ) : (
            <button onClick={() => setActiveTab('my_tasks')} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${activeTab === 'my_tasks' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}>
              <ClipboardList className="w-5 h-5" /> My Tasks
            </button>
          )}
        </nav>

        <button onClick={handleLogout} className="mt-auto flex items-center gap-2 text-slate-400 hover:text-white p-2">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto h-screen p-4 md:p-8 max-w-7xl mx-auto w-full">
         
         {currentUser.role === 'admin' && activeTab === 'live_monitor' && (
            <LiveMonitor machines={machines} users={users} onAssign={handleAssignTech} />
         )}

         {currentUser.role === 'admin' && activeTab === 'factory_manager' && (
            <FactoryManager 
              buildings={buildings} floorsMap={floorsMap} linesMap={linesMap} machinesMap={machinesMap}
              onAddBuilding={handleAddBuilding} onAddFloor={handleAddFloor} onAddLine={handleAddLine} onAddMachine={handleAddMachine}
            />
         )}

         {currentUser.role === 'admin' && activeTab === 'inventory' && (
            <InventoryManager 
              parts={parts} 
              partRequests={partRequests}
              onAddPart={handleAddPart} 
              onDeletePart={handleDeletePart} 
              onUpdateStock={handleUpdateStock}
              onResolveRequest={handleResolveRequest}
            />
         )}

         {currentUser.role === 'admin' && activeTab === 'analytics' && (
            <AnalyticsDashboard logs={logs} machines={machines} parts={parts} floors={floors} lines={lines} />
         )}

         {currentUser.role === 'admin' && activeTab === 'user_setup' && (
            <div className="space-y-8">
              <UserSetupView onAddUser={handleAddUser} />
              <Card className="p-6 border-t-4 border-t-purple-500">
                <h3 className="font-bold mb-2">System Tools</h3>
                <Button variant="warning" onClick={handleSeedData}>Generate Demo Factory & Users</Button>
              </Card>
            </div>
         )}

         {currentUser.role === 'technician' && activeTab === 'my_tasks' && (
            <TechnicianTaskBoard 
              currentUser={users.find(u => u.id === currentUser.id) || currentUser}
              machines={machines} 
              parts={parts}
              onScanStart={handleScanStart} 
              onComplete={handleCompleteWork}
              onSelfAssign={handleSelfAssign} 
              onRequestPart={handleRequestPart}
            />
         )}

      </div>
    </div>
  );
}
