import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { employeeService } from "@/services/employeeService";
import { leaveService } from "@/services/leaveService";
import { useState, useEffect } from "react";

export const CreateLeaveRequestForm = ({ onFinished }: { onFinished: () => void }) => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [employeeId, setEmployeeId] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setEmployees(employeeService.getAllEmployees());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!employeeId || !type || !startDate || !endDate || !reason) {
      setError("Please fill out all fields.");
      return;
    }

    try {
      await leaveService.createLeave({
        employeeId: parseInt(employeeId),
        type: type as any,
        startDate,
        endDate,
        reason,
      });
      onFinished();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500">{error}</p>}
      <Select onValueChange={setEmployeeId} value={employeeId}>
        <SelectTrigger>
          <SelectValue placeholder="Select Employee" />
        </SelectTrigger>
        <SelectContent>
          {employees.map((emp) => (
            <SelectItem key={emp.id} value={String(emp.id)}>
              {emp.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select onValueChange={setType} value={type}>
        <SelectTrigger>
          <SelectValue placeholder="Leave Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Sick Leave">Sick Leave</SelectItem>
          <SelectItem value="Vacation">Vacation</SelectItem>
          <SelectItem value="Personal">Personal</SelectItem>
          <SelectItem value="Emergency">Emergency</SelectItem>
        </SelectContent>
      </Select>

      <div className="grid grid-cols-2 gap-4">
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          placeholder="Start Date"
        />
        <Input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          placeholder="End Date"
        />
      </div>

      <Textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason for leave"
      />

      <Button type="submit" className="w-full">Submit Request</Button>
    </form>
  );
};