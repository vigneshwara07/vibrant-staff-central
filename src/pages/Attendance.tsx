
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Clock, Calendar, Users, CheckCircle, XCircle, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AttendanceRecord from "@/components/AttendanceRecord";

export interface AttendanceEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  clockIn?: string;
  clockOut?: string;
  status: "present" | "absent" | "late" | "partial";
  totalHours?: number;
}

const Attendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceEntry[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load data from localStorage
  useEffect(() => {
    const savedAttendance = localStorage.getItem("attendance");
    const savedEmployees = localStorage.getItem("employees");
    
    if (savedAttendance) {
      setAttendanceRecords(JSON.parse(savedAttendance));
    }
    
    if (savedEmployees) {
      setEmployees(JSON.parse(savedEmployees));
    }
  }, []);

  // Save attendance to localStorage
  useEffect(() => {
    localStorage.setItem("attendance", JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  const handleClockIn = (employeeId: string, employeeName: string) => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const currentDate = now.toISOString().split('T')[0];
    
    // Check if already clocked in today
    const existingRecord = attendanceRecords.find(
      record => record.employeeId === employeeId && record.date === currentDate
    );

    if (existingRecord && existingRecord.clockIn) {
      toast({
        title: "Already clocked in",
        description: `${employeeName} has already clocked in today at ${existingRecord.clockIn}`,
        variant: "destructive"
      });
      return;
    }

    const status = now.getHours() > 9 ? "late" : "present"; // 9 AM cutoff for late

    const newRecord: AttendanceEntry = {
      id: existingRecord?.id || Date.now().toString(),
      employeeId,
      employeeName,
      date: currentDate,
      clockIn: currentTime,
      clockOut: existingRecord?.clockOut,
      status,
    };

    if (existingRecord) {
      setAttendanceRecords(records => 
        records.map(record => 
          record.id === existingRecord.id ? newRecord : record
        )
      );
    } else {
      setAttendanceRecords(records => [...records, newRecord]);
    }

    toast({
      title: "Clocked in successfully",
      description: `${employeeName} clocked in at ${currentTime}`,
    });
  };

  const handleClockOut = (employeeId: string, employeeName: string) => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const currentDate = now.toISOString().split('T')[0];
    
    const existingRecord = attendanceRecords.find(
      record => record.employeeId === employeeId && record.date === currentDate
    );

    if (!existingRecord || !existingRecord.clockIn) {
      toast({
        title: "No clock-in record",
        description: `${employeeName} must clock in first`,
        variant: "destructive"
      });
      return;
    }

    if (existingRecord.clockOut) {
      toast({
        title: "Already clocked out",
        description: `${employeeName} has already clocked out today at ${existingRecord.clockOut}`,
        variant: "destructive"
      });
      return;
    }

    // Calculate total hours
    const clockInTime = new Date(`${currentDate}T${existingRecord.clockIn}`);
    const clockOutTime = new Date(`${currentDate}T${currentTime}`);
    const totalHours = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);

    const updatedRecord = {
      ...existingRecord,
      clockOut: currentTime,
      totalHours: Math.round(totalHours * 100) / 100,
      status: totalHours < 4 ? "partial" : existingRecord.status
    };

    setAttendanceRecords(records => 
      records.map(record => 
        record.id === existingRecord.id ? updatedRecord : record
      )
    );

    toast({
      title: "Clocked out successfully",
      description: `${employeeName} clocked out at ${currentTime}. Total hours: ${updatedRecord.totalHours}`,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    navigate("/login");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  const todaysRecords = attendanceRecords.filter(record => record.date === selectedDate);
  const presentToday = todaysRecords.filter(record => record.status === "present").length;
  const lateToday = todaysRecords.filter(record => record.status === "late").length;
  const absentToday = employees.length - todaysRecords.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Clock className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => navigate("/employees")} variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Employees
              </Button>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Present</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{presentToday}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Late</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{lateToday}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Absent</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{absentToday}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{employees.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Clock In/Out Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Clock In/Out</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employees.map(employee => {
                const todayRecord = todaysRecords.find(record => record.employeeId === employee.id);
                return (
                  <div key={employee.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{employee.firstName} {employee.lastName}</h3>
                        <p className="text-sm text-gray-600">{employee.department}</p>
                      </div>
                      {todayRecord && (
                        <Badge variant={
                          todayRecord.status === "present" ? "default" :
                          todayRecord.status === "late" ? "secondary" :
                          "destructive"
                        }>
                          {todayRecord.status}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      {todayRecord?.clockIn && (
                        <p className="text-sm">Clock In: <span className="font-medium">{todayRecord.clockIn}</span></p>
                      )}
                      {todayRecord?.clockOut && (
                        <p className="text-sm">Clock Out: <span className="font-medium">{todayRecord.clockOut}</span></p>
                      )}
                      {todayRecord?.totalHours && (
                        <p className="text-sm">Total Hours: <span className="font-medium">{todayRecord.totalHours}h</span></p>
                      )}
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        onClick={() => handleClockIn(employee.id, `${employee.firstName} ${employee.lastName}`)}
                        disabled={todayRecord?.clockIn !== undefined}
                        className="flex-1"
                      >
                        Clock In
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleClockOut(employee.id, `${employee.firstName} ${employee.lastName}`)}
                        disabled={!todayRecord?.clockIn || todayRecord?.clockOut !== undefined}
                        className="flex-1"
                      >
                        Clock Out
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Attendance Records */}
        <AttendanceRecord 
          records={todaysRecords} 
          selectedDate={selectedDate}
        />
      </div>
    </div>
  );
};

export default Attendance;
