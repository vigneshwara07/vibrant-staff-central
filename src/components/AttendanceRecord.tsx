
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { AttendanceEntry } from "@/pages/Attendance";

interface AttendanceRecordProps {
  records: AttendanceEntry[];
  selectedDate: string;
}

const AttendanceRecord = ({ records, selectedDate }: AttendanceRecordProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "present": return "default";
      case "late": return "secondary";
      case "partial": return "outline";
      case "absent": return "destructive";
      default: return "outline";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Attendance Records - {new Date(selectedDate).toLocaleDateString()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No attendance records found for this date.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Clock In</TableHead>
                <TableHead>Clock Out</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">
                    {record.employeeName}
                  </TableCell>
                  <TableCell>
                    {record.clockIn || "-"}
                  </TableCell>
                  <TableCell>
                    {record.clockOut || "-"}
                  </TableCell>
                  <TableCell>
                    {record.totalHours ? `${record.totalHours}h` : "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(record.status)}>
                      {record.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default AttendanceRecord;
